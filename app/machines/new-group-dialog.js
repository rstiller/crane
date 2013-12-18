
angular.module('dashboard.controllers').controller('NewGroupCtrl',
    ['$scope', 'MachineGroupEntity', 'MachineEntity',
    function($scope, MachineGroupEntity, MachineEntity) {

    $scope.data = {
        name: '',
        description: '',
        ready: false,
        selectedMachines: []
    };
    $scope.cssClass = 'new-group-dialog';

    $scope.init = function() {
        $scope.data.ready = false;
        MachineEntity.all(function(err, machines) {
            $scope.data.machines = machines;
            $scope.data.ready = true;
            $scope.$apply();
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveGroup = function() {
        var machines = [];

        angular.forEach($scope.data.selectedMachines, function(machine) {
            machines.push(machine.get('_id'));
        });

        var group = new MachineGroupEntity({
            name: $scope.data.name,
            description: $scope.data.description,
            machines: machines
        });

        group.save({
            error: function(model, err, options) {
                console.log(err);
            },
            success: function(model, response, option) {
                $scope.closeDialog();
                $scope.$apply();
            }
        });
    };

}]);


angular.module('dashboard.controllers').controller('NewGroupCtrl',
    ['$scope', 'MachineGroupEntity',
    function($scope, MachineGroupEntity) {

    $scope.data = {
        'name': '',
        'description': ''
    };
    $scope.cssClass = 'new-group-dialog';

    $scope.init = function() {
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveGroup = function() {
        var group = new MachineGroupEntity({
            name: $scope.data.name,
            description: $scope.data.description
        });

        group.update(function(err) {
            if(!!err) {
                console.log(err);
                return;
            }

            $scope.closeDialog();
            $scope.$apply();
        });
    };

}]);


angular.module('dashboard.controllers').controller('NewGroupCtrl',
    ['$scope', 'MachineGroup', 'Machine',
    function($scope, MachineGroup, Machine) {

    $scope.data = {
        name: '',
        description: ''
    };
    $scope.cssClass = 'new-group-dialog';

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveGroup = function() {
        var group = new MachineGroup({
            name: $scope.data.name,
            description: $scope.data.description
        });

        group.save({
            error: function(model, err, options) {
                console.log(err);
            },
            success: function(model, response, option) {
                $scope.closeDialog();
                if(!!$scope.saveCallback) {
                    $scope.saveCallback();
                }
                $scope.$apply();
            }
        });
    };

}]);

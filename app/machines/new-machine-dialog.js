
angular.module('dashboard.controllers').controller('NewMachineCtrl',
    ['$scope', 'MachineEntity',
    function($scope, MachineEntity) {

    $scope.cssClass = 'new-machine-dialog';

    $scope.init = function() {
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveMachine = function() {
    };

}]);

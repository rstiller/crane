
angular.module('dashboard.controllers').controller('RemoveMachineCtrl',
    ['$scope',
    function($scope) {

    $scope.cssClass = 'remove-machine-dialog';

    $scope.init = function() {
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

}]);

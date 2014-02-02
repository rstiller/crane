
angular.module('dashboard.controllers').controller('ManageUploadsCtrl',
    ['$scope',
    function($scope) {

    $scope.data = {
    };
    $scope.cssClass = 'manage-uploads-dialog';

    $scope.init = function() {
    	console.log($scope.group, $scope.machines);
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };
    
    $scope.applyChanges = function() {
    	// TODO
    };

}]);


angular.module('dashboard.widgets').controller('DeployHistoryDialogCtrl',
    ['$scope', 'DeployJob', function($scope, DeployJob) {

    $scope.cssClass = 'deploy-history-dialog';
    $scope.data = {};
    $scope.data.ready = false;
    
    $scope.init = function() {
    	$scope.project.getDeployJobs({
            error: function(err) {
                console.log(err);
            },
            success: function(deployments) {
                $scope.data.deployments = deployments;
                $scope.data.ready = true;
                $scope.$apply();
                console.log($scope.data.deployments);
            }
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };
    
}]);

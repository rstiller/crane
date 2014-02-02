
angular.module('dashboard.widgets').controller('ProjectUploadHistoryDialogCtrl',
    ['$scope', 'UploadJob', function($scope, UploadJob) {

    $scope.cssClass = 'project-upload-history-dialog';
    $scope.data = {};
    $scope.data.ready = false;
    
    $scope.init = function() {
    	$scope.project.getUploadJobs({
            error: function(err) {
                console.log(err);
            },
            success: function(uploads) {
                $scope.data.uploads = uploads;
                $scope.data.ready = true;
                $scope.$apply();
            }
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };
    
}]);

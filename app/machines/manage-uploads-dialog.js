
angular.module('dashboard.controllers').controller('ManageUploadsCtrl',
    ['$scope', 'Project', 'UploadJob',
    function($scope, Project, UploadJob) {

    $scope.data = {
        images: null,
    	ready: false,
    	selectedImages: null
    };
    $scope.cssClass = 'manage-uploads-dialog';

    $scope.init = function() {
    	$scope.data.ready = false;
    	
    	Project.getImages({
    		success: function(images) {
    			$scope.data.images = images;
    			$scope.data.ready = true;
    			$scope.$apply();
    		}
    	});
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };
    
    $scope.upload = function() {
    	var jobs = [];
    	
    	angular.forEach($scope.data.selectedImages, function(image) {
            var uploadJob = new UploadJob({
                'projectId': image.id,
                'workingCopyName': image.version,
                'workingCopyType': image.type,
                'workingCopyRev': image.rev,
                'machineGroupId': $scope.group.get('_id'),
                'services': [image.service],
                'environment': image.environment
            });
            jobs.push(uploadJob);
    	});
    	
    	UploadJob.saveAll(jobs, function(err) {
    		if(!!err) {
    			console.log(err);
    			return;
    		}
    		
    		$scope.closeDialog();
            $scope.$apply();
    	});
    };

}]);

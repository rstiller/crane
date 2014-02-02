
angular.module('dashboard.widgets').controller('ProjectUploadDialogCtrl',
    ['$scope', 'Project', 'MachineGroup', 'UploadJob', function($scope, Project, MachineGroup, UploadJob) {

    $scope.cssClass = 'project-upload-dialog';
    $scope.data = {};
    $scope.data.ready = false;
    $scope.data.group = null;

    $scope.$watch('version', function(revision) {
        var workingCopy = Project.getWorkingCopy($scope.project, revision);
        $scope.data.version = workingCopy.name;
    });
    
    $scope.init = function() {
    	MachineGroup.all({
            error: function(err) {
                console.log(err);
            },
            success: function(groups) {
                $scope.data.groups = groups;
                if(!!groups && groups.length > 0) {
                	$scope.data.group = groups[0];
                }
                $scope.data.ready = true;
                $scope.$apply();
            }
        });
    };

    $scope.upload = function() {
        var workingCopy = Project.getWorkingCopy($scope.project, $scope.version);
        var uploadJob = new UploadJob({
            'projectId': $scope.project.get('_id'),
            'workingCopyName': workingCopy.name,
            'workingCopyType': workingCopy.type,
            'workingCopyRev': workingCopy.rev,
            'machineGroupId': $scope.data.group.get('_id'),
            'services': $scope.services,
            'environment': $scope.environment
        });
        uploadJob.save({
        	error: function(err) {
        		console.log(err);
        	},
        	success: function() {
        		$scope.closeDialog();
                $scope.$apply();
        	}
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

}]);

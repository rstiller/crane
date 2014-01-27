
angular.module('dashboard.widgets').controller('DeployDialogCtrl',
    ['$scope', 'Project', 'DeployJob', function($scope, Project, DeployJob) {

    $scope.cssClass = 'deploy-dialog';
    $scope.data = {};
    $scope.data.ready = false;

    $scope.$watch('version', function(revision) {
        var workingCopy = Project.getWorkingCopy($scope.project, revision);
        $scope.data.version = workingCopy.name;
    });

    $scope.deploy = function() {
        var workingCopy = Project.getWorkingCopy($scope.project, $scope.version);
        // TODO: choose machine-group
        var deployJob = new DeployJob({
            'projectId': $scope.project.get('_id'),
            'workingCopyName': workingCopy.name,
            'workingCopyType': workingCopy.type,
            'workingCopyRev': workingCopy.rev,
            'machineGroupId': null,
            'service': $scope.service,
            'environment': $scope.environment
        });
        deployJob.save({
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

}]);

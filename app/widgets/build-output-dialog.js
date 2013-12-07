
angular.module('dashboard.widgets').controller('BuildOutputDialogCtrl',
    ['$scope', 'BuildLogEntity', function($scope, BuildLogEntity) {
    
    $scope.cssClass = 'build-output-dialog';
    $scope.data = {};
    $scope.data.ready = false;
    
    $scope.$watch('build', function(build) {
        BuildLogEntity.forBuild(build, function(err, logs) {
            angular.forEach(logs, function(log) {
                log.collapsed = true;
            });
            $scope.data.logs = logs;
            $scope.data.ready = true;
            $scope.$apply();
        });
    });
    
    $scope.closeDialog = function() {
        $scope.$parent.close();
    };
    
}]);


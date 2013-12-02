
angular.module('dashboard.controllers').controller('ProjectDetailCtrl',
    ['$scope', '$stateParams', 'Cache', 'DBS', function($scope, $stateParams, Cache, DBS) {
    
    $scope.data = {};
    $scope.data.selectedEnvironment = '';
    $scope.data.selectedVersion = {};
    $scope.data.versions = [];
    $scope.data.environments = [];
    
    $scope.selectEnvironment = function(environment) {
        $scope.data.selectedEnvironment = environment;
    };
    
    $scope.$watch('data.selectedVersion', function() {
        var environmentNames = {};
        angular.forEach($scope.data.selectedVersion.runConfigs, function(runConfig) {
            environmentNames[runConfig.environment] = environmentNames[runConfig.environment] || [];
            environmentNames[runConfig.environment].push(runConfig.serviceName);
        });
        var environemnts = [];
        angular.forEach(environmentNames, function(value, key) {
            environemnts.push({
                'name': key,
                'services': value
            });
        });
        $scope.data.environments = environemnts;
        $scope.data.selectedEnvironment = '';
    });
    
    DBS.Projects.get($stateParams.projectId, function(err, project) {
        
        $scope.data.project = project;
        
        Cache.get(project.url, function(data) {
        });
        
        var versions = {};
        
        angular.forEach(project.branches, function(branch, branchName) {
            versions[branchName] = branch;
            if(branchName === 'master') {
                $scope.data.selectedVersion = branch;
            }
        });
        angular.forEach(project.tags, function(tag, tagName) {
            versions[tagName] = tag;
        });
        
        $scope.data.versions = versions;
        
    });
    
}]);

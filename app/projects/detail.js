
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
        var environments = [];
        
        angular.forEach($scope.data.selectedVersion.infrastructure.environments, function(variables, name) {
            environments.push(name);
        });
        
        environments.sort();
        
        $scope.data.environments = environments;
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

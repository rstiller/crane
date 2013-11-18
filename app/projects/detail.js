
angular.module('dashboard.controllers').controller('ProjectDetailCtrl', ['$scope', '$stateParams', 'Projects', 'Cache',
                                                                         function($scope, $stateParams, Projects, Cache) {
    
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
    
    Projects.get({
        'id': $stateParams.projectId
    }, function(project) {
        
        $scope.data.project = project;
        
        Cache.get(project.url, function(data) {
        });
        
        var versions = [];
        
        angular.forEach(project.branches, function(branch) {
            versions.push(branch);
            if(branch.name === 'master') {
                $scope.data.selectedVersion = branch;
            }
        });
        angular.forEach(project.tags, function(tag) {
            versions.push(tag);
        });
        
        $scope.data.versions = versions;
        
    });
    
}]);

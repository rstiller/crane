
angular.module('dashboard.controllers').controller('ProjectDetailCtrl', ['$scope', '$stateParams', 'Projects', 'Cache',
                                                                         function($scope, $stateParams, Projects, Cache) {
    
    $scope.data = {};
    $scope.diagramData = null;
    $scope.data.currentVersion = null;
    
    $scope.selectVersion = function(version) {
        $scope.data.currentVersion = version;
        
        var data = {};
        
        data.name = version.name;
        data.children = [];
        
        angular.forEach(version.runConfigs, function(config) {
            var exists = false;
            angular.forEach(data.children, function(envConfig) {
                if(envConfig.name === config.environment) {
                    exists = true;
                }
            });
            if(exists === false) {
                data.children.push({
                    'name': config.environment,
                    'children': []
                });
            }
        });
        
        angular.forEach(version.runConfigs, function(config) {
            angular.forEach(data.children, function(envConfig) {
                if(envConfig.name === config.environment) {
                    envConfig.children.push({
                        'name': config.serviceName,
                        'size': 1
                    });
                }
            });
        });
        
        if(version.runConfigs.length > 0) {
            $scope.diagramData = data;
        }
        
    };
    
    Projects.get({
        'id': $stateParams.projectId
    }, function(project) {
        
        $scope.data.project = project;
        $scope.data.versions = [];
        
        Cache.get(project.url, function(data) {
        });
        
        angular.forEach(project.branches, function(branch) {
            $scope.data.versions.push(branch)
        });
        angular.forEach(project.tags, function(tag) {
            $scope.data.versions.push(tag)
        });
        
    });
    
}]);

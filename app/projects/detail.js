
angular.module('dashboard.controllers').controller('ProjectDetailCtrl',
    ['$scope', '$stateParams', 'Cache', 'DBS', 'RenderPipeline',
    function($scope, $stateParams, Cache, DBS, RenderPipeline) {
    
    $scope.data = {};
    $scope.data.selectedEnvironment = '';
    $scope.data.selectedVersion = {};
    $scope.data.versions = [];
    $scope.data.environments = [];
    
    var renderPipeline = new RenderPipeline(function(next) {
        
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
            $scope.$apply();
            
            next();
            
        });
        
    });
    
    $scope.selectEnvironment = function(environment) {
        $scope.data.selectedEnvironment = environment;
    };
    
    $scope.$watch('data.selectedVersion', function() {
        var environments = [];
        
        if(!!$scope.data.selectedVersion.infrastructure) {
            angular.forEach($scope.data.selectedVersion.infrastructure.environments, function(variables, name) {
                environments.push(name);
            });
        }
        
        environments.sort();
        
        $scope.data.environments = environments;
        if(!!environments[0]) {
            $scope.data.selectedEnvironment = environments[0];
        }
    });
    
    DBS.Projects.changes({
        continuous: true,
        onChange: function(change) {
            if(change.id === $stateParams.projectId) {
                renderPipeline.push({});
            }
        }
    });
    
    renderPipeline.push({});
    
}]);

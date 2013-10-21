
angular.module('dashboard.controllers').controller('NewProjectCtrl', ['$scope', 'Cache', 'Projects',
                                                                      function($scope, Cache, Projects) {
    
    $scope.project = {};
    $scope.branches = [];
    $scope.cssClass = "new-project-dialog";
    $scope.buildTags = true;
    $scope.buildBranches = [];
    
    $scope.init = function() {
        
        Cache.get($scope.url, function(project) {
            
            Cache.getRaw(project.branches_url.replace('{/branch}', ''), function(branches) {
                $scope.branches = branches;
                
                angular.forEach(branches, function(branch) {
                    if(branch.name == 'master') {
                        $scope.buildBranches = [branch];
                    }
                });
            });
            
            $scope.project = project;
            if(!!project.description && !!project.description.length > 0) {
                $scope.cssClass = "new-project-dialog-with-description";
            }
            
        });
        
    };
    
    $scope.closeDialog = function() {
        $scope.$parent.close();
    };
    
    $scope.saveProject = function() {
        
        var branches = [];
        
        angular.forEach($scope.buildBranches, function(branch) {
            branches.push(branch.name);
        });
        
        Projects.save({
            'name': $scope.project.name,
            'url': $scope.project.html_url,
            'buildTags': $scope.buildTags,
            'branches': branches
        }, function() {
            if($scope.saveCallback) {
                $scope.saveCallback(); 
            }
            $scope.$parent.close();
        });
        
    };
    
}]);

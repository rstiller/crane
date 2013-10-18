
angular.module('dashboard.controllers').controller('NewProjectCtrl', ['$scope', 'Cache',
                                                                      function($scope, Cache) {
    
    $scope.project = {};
    $scope.branches = [];
    
    $scope.init = function() {
        
        Cache.get($scope.url, function(project) {
            
            Cache.getRaw(project.branches_url.replace('{/branch}', ''), function(branches) {
                $scope.branches = branches;
            });
            
            $scope.project = project;
            
        });
        
    };
    
}]);

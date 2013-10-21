
angular.module('dashboard.controllers').controller('ProjectDetailCtrl', ['$scope', '$stateParams', 'Projects', 'Cache',
                                                                         function($scope, $stateParams, Projects, Cache) {
    
    $scope.data = {};
    $scope.versions = [];
    $scope.gridOptions = {
        'data': 'versions'
    };
    
    Projects.get({
        'id': $stateParams.projectId
    }, function(project) {
        
        $scope.data.project = project;
        
        Cache.get(project.url, function(data) {
        });
        
        angular.forEach(project.branches, function(branch) {
            $scope.versions.push({
                'version': branch.name,
                'ref': branch.ref,
                'type': branch.type
            });
        });
        
    });
    
}]);

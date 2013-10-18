
angular.module('dashboard.controllers').controller('ProjectDetailCtrl', ['$scope', '$stateParams', 'Projects', 'Cache',
                                                                         function($scope, $stateParams, Projects, Cache) {
    
    $scope.data = {};
    
    Projects.get({
        'id': $stateParams.projectId
    }, function(project) {
        
        $scope.data.project = project;
        
        Cache.get(project.url, function(data) {
        });
        
    });
    
}]);


angular.module('dashboard.controllers').controller('ProjectDetailCtrl', ['$scope', '$stateParams', 'Projects', 'GithubProjectCache',
                                                                         function($scope, $stateParams, Projects, GithubProjectCache) {
    
    $scope.data = {};
    
    Projects.get({
        'id': $stateParams.projectId
    }, function(project) {
        
        $scope.data.project = project;
        
        GithubProjectCache.get(project, function(data) {
            console.log(data);
        });
        
    });
    
}]);

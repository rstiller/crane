
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl', ['$scope', 'Projects', function($scope, Projects) {
    
    $scope.data = {};
    $scope.data.newProject = {
        'name': '',
        'url': ''
    };
    
    $scope.save = function() {
        Projects.save({}, $scope.data.newProject, function() {
            Projects.query({}, function(projects) {
                $scope.data.projects = projects;
            });
        });
    };
    
    Projects.query({}, function(projects) {
        $scope.data.projects = projects;
    });
    
}]);

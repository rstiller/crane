
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl', ['$scope', '$http', 'Projects', function($scope, $http, Projects) {
    
    $scope.data = {};
    $scope.data.newProject = {
        'name': '',
        'url': ''
    };
    
    var refresh = function() {
        Projects.query({}, function(projects) {
            
            for(var i = 0; i < projects.elements.length; i++) {
                
                var project = projects.elements[i];
                var repo = project.url.split('https://github.com/')[1];
                
                project.imageUrl = '';
                
                $http.jsonp('https://api.github.com/repos/' + repo + '?callback=JSON_CALLBACK').success(function(response) {
                    
                    angular.forEach($scope.data.projects.elements, function(project) {
                        
                        if(project.url == response.data.html_url) {
                            project.imageUrl = response.data.owner.avatar_url;
                        }
                        
                    });
                    
                });
                
            }
            
            $scope.data.projects = projects;
        });
    };
    
    $scope.save = function() {
        Projects.save({}, $scope.data.newProject, function() {
            $scope.data.newProject = {
                'name': '',
                'url': ''
            };
            refresh();
        });
    };
    
    $scope.remove = function(id) {
        Projects.remove({ 'id': id }, function() {
            refresh();
        });
    };
    
    refresh();
    
}]);

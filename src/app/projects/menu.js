
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl', ['$scope', '$http', 'Projects', 'GithubProjectCache', 'Dialog',
                                                                        function($scope, $http, Projects, GithubProjectCache, Dialog) {
    
    $scope.data = {};
    $scope.data.newProject = {
        'url': ''
    };
    
    var refresh = function() {
        Projects.query({}, function(projects) {
            
            $scope.data.projects = projects;
            
            for(var i = 0; i < projects.elements.length; i++) {
                
                var project = projects.elements[i];
                
                project.imageUrl = '';
                
                GithubProjectCache.get(project, function(data) {
                    
                    angular.forEach($scope.data.projects.elements, function(project) {
                        
                        if(project.url == data.html_url) {
                            project.imageUrl = data.owner.avatar_url;
                        }
                        
                    });
                    
                });
                
            }
            
        });
    };
    
    $scope.openDialog = function() {
        new Dialog('NewProjectCtrl', 'app/projects/newProject.tpl.html');
    };
    
    $scope.remove = function(id) {
        Projects.get({ 'id': id }, function(project) {
            GithubProjectCache.clear(project);
        });
        Projects.remove({ 'id': id }, function() {
            refresh();
        });
    };
    
    refresh();
    
}]);

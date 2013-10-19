
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl', ['$scope', '$http', 'Projects', 'Cache', 'Dialog',
                                                                        function($scope, $http, Projects, Cache, Dialog) {
    
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
                
                Cache.get(project.url, function(data) {
                    
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
        new Dialog('#dialog', 'NewProjectCtrl', 'app/projects/newProject.tpl.html', {
            url: $scope.data.newProject.url,
            saveCallback: refresh
        });
        $scope.data.newProject.url = '';
    };
    
    $scope.remove = function(id, url) {
        Cache.clear(url);
        Projects.remove({ 'id': id }, function() {
            refresh();
        });
    };
    
    refresh();
    
}]);

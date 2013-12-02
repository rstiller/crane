
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl',
    ['$rootScope', '$scope', '$http', '$location', 'Cache', 'Dialog', 'DBS', function($rootScope, $scope, $http, $location, Cache, Dialog, DBS) {
    
    $scope.data = {};
    $scope.data.newProject = {
        'url': ''
    };
    
    var refreshProject = function(project) {
        project.imageUrl = '';
        
        Cache.get(project.url, function(data) {
            angular.forEach($scope.data.projects.elements, function(project) {
                if(project.url == data.html_url) {
                    project.imageUrl = data.owner.avatar_url;
                }
            });
        });
    };
    var refreshAllProjects = function() {
        
        DBS.Projects.allDocs({
            include_docs: true
        }, function(err, docs) {
            if(!!err) {
                console.log(err);
                return;
            }
            
            var projects = [];
            angular.forEach(docs.rows, function(row) {
                projects.push(row.doc);
                refreshProject(row.doc);
            });
            $scope.data.projects = projects;
        });
        
    };
    
    $scope.openDialog = function() {
        new Dialog('#dialog', 'NewProjectCtrl', 'app/projects/newProjectDialog.tpl.html', {
            url: $scope.data.newProject.url,
            saveCallback: refreshAllProjects
        });
        $scope.data.newProject.url = '';
    };
    
    $scope.remove = function(id, url) {
        Cache.clear(url);
        
        // TODO: remove project
        
        if($rootScope.$stateParams.projectId == id) {
            $location.path('/projects/');
        }
    };
    
    DBS.Projects.changes({
        continuous: true,
        onChange: function(change) {
            refreshAllProjects();
        }
    });
    
    refreshAllProjects();
    
}]);

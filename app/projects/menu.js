
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl',
    ['$rootScope', '$scope', '$http', '$location', 'Cache', 'Dialog', 'ProjectEntity', 'RenderPipeline',
     function($rootScope, $scope, $http, $location, Cache, Dialog, ProjectEntity, RenderPipeline) {

    $scope.data = {};
    $scope.data.newProject = {
        'url': ''
    };
    $scope.data.ready = false;

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        ProjectEntity.all(function(err, projects) {
            if(!!err) {
                console.log(err);
                return;
            }

            $scope.data.projects = projects;
            angular.forEach(projects, function(project) {
                refreshProject(project);
            });

            $scope.data.ready = true;
            $scope.$apply();

            next();
        });
    });

    var refreshProject = function(project) {
        Cache.get(project.url, function(data) {
            angular.forEach($scope.data.projects, function(project) {
                if(project.url === data.html_url && !project.imageUrl) {
                    project.imageUrl = data.owner.avatar_url;
                }
            });
        });
    };

    $scope.openDialog = function() {
        new Dialog('#dialog', 'NewProjectCtrl', 'app/projects/new-project-dialog.tpl.html', {
            url: $scope.data.newProject.url,
            saveCallback: function() {
                renderPipeline.push({});
            }
        });
        $scope.data.newProject.url = '';
    };

    $scope.remove = function(project, url) {
        Cache.clear(url);

        project.remove(function(err, response) {
            if(!!err) {
                console.log(err);
                return;
            }

            if($rootScope.$stateParams.projectId == project._id) {
                $location.path('/projects/');
            }
        });
    };

    $rootScope.$on('projects.update', function(event, project) {
        renderPipeline.push({});
    })

    renderPipeline.push({});

}]);

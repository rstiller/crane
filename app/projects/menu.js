
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl',
    ['$rootScope', '$scope', '$http', '$location', 'Hoster', 'Dialog', 'ProjectEntity', 'RenderPipeline',
     function($rootScope, $scope, $http, $location, Hoster, Dialog, ProjectEntity, RenderPipeline) {

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
        Hoster.get(project.get('url')).getRepositoryImageUrl(project.get('url'), function(err, imageUrl) {
            if(!!err) {
                console.log(err);
                return;
            }

            project.set('imageUrl', imageUrl);
            $scope.$apply();
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

    $scope.remove = function(project) {
        Hoster.get(project.get('url')).clearCache(project.get('url'));

        project.destroy({
            error: function(model, err, options) {
                console.log(err);
            },
            success: function(model, response, options) {
                if($rootScope.$stateParams.projectId == project.get('_id')) {
                    $location.path('/projects/');
                }
            }
        });
    };

    $rootScope.$on('projects.update', function(event, project) {
        renderPipeline.push({});
    })

    renderPipeline.push({});

}]);

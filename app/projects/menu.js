
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl',
    ['$rootScope', '$scope', '$http', '$location', 'Hoster', 'Dialog', 'Project', 'RenderPipeline', 'ShellCommand',
     function($rootScope, $scope, $http, $location, Hoster, Dialog, Project, RenderPipeline, ShellCommand) {

    $scope.data = {};
    $scope.data.newProject = {
        'url': ''
    };
    $scope.data.ready = false;

    ShellCommand.all({
        success: function(commands) {
            console.log(commands);
        }
    });

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        Project.all({
            error: function(err) {
                console.log(err);
                next(err);
            },
            success: function(projects) {
                $scope.data.projects = projects;
                angular.forEach(projects, function(project) {
                    refreshProject(project);
                });

                $scope.data.ready = true;
                $scope.$apply();

                next();
            }
        });
    });

    var refreshProject = function(project) {
        var url = project.get('url');
        Hoster.get(url).getRepositoryImageUrl(url, function(err, imageUrl) {
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
                renderPipeline.push({});
            },
            success: function(model, response, options) {
                if($rootScope.$stateParams.projectId == project.get('_id')) {
                    $location.path('/projects/');
                }
                renderPipeline.push({});
            }
        });
    };

    $rootScope.$on('projects.update', function(event, project) {
        renderPipeline.push({});
    })

    renderPipeline.push({});

}]);

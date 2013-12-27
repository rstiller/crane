angular.module('dashboard.widgets').directive('serviceWidget',
    ['Project', 'Dialog',
    function(Project, Dialog) {

    function getWorkingCopy(project, version) {
        var workingCopy = null;

        angular.forEach(project.get('branches'), function(branch) {
            if(version === branch.rev) {
                workingCopy = branch;
            }
        });

        if(!workingCopy) {
            angular.forEach(project.get('tags'), function(tag) {
                if(version === tag.rev) {
                    workingCopy = tag;
                }
            });
        }

        return workingCopy;
    }

    return {
        replace: true,
        scope: {
            projectId: '@project',
            service: '@service',
            version: '@version',
            environment: '@environment'
        },
        templateUrl: 'app/widgets/service-widget.tpl.html',
        controller: ['$scope', function($scope) {

            var update = function() {

                $scope.data.workingCopy = null;
                $scope.data.service = null;
                $scope.data.environment = null;
                $scope.data.builds = null;

                var project = new Project({
                    '_id': $scope.projectId
                });

                project.fetch({
                    error: function(model, err, options) {
                        console.log(err);
                    },
                    success: function(project, response, options) {
                        $scope.data.workingCopy = getWorkingCopy(project, $scope.version);
                        var service = $scope.data.workingCopy.infrastructure.services[$scope.service];
                        service.ports = service.ports.join(', ');
                        $scope.data.service = service;
                        $scope.data.environment = $scope.data.service.environments[$scope.environment];

                        project.getBuildJobs({
                            error: function(model, err) {
                                console.log(err);
                            },
                            success: function(builds) {
                                angular.forEach(builds, function(build) {
                                    build.set('finished', new Date(build.get('finished')));
                                    build.set('started', new Date(build.get('started')));
                                });
                                $scope.data.builds = builds;
                                $scope.$apply();
                            }
                        });
                    }
                });
            };

            $scope.data = {};
            $scope.$watch('projectId', update);
            $scope.$watch('service', update);
            $scope.$watch('version', update);
            $scope.$watch('environment', update);

            $scope.openDialog = function(build) {
                new Dialog('#service-widget-console-output', 'BuildOutputDialogCtrl', 'app/widgets/build-output-dialog.tpl.html', {
                    build: build
                });
            };

        }]
    };

}]);

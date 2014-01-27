angular.module('dashboard.widgets').directive('serviceWidget',
    ['Project', 'Dialog', 'BuildJob',
    function(Project, Dialog, BuildJob) {

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
                        $scope.data.workingCopy = Project.getWorkingCopy(project, $scope.version).workingCopy;
                        var service = $scope.data.workingCopy.infrastructure.services[$scope.service];
                        service.ports = service.ports.join(', ');
                        $scope.data.service = service;
                        $scope.data.environment = $scope.data.service.environments[$scope.environment];

                        project.getBuildJobs({
                            params: {
                                limit: 3,
                                descending: true
                            },
                            error: function(model, err) {
                                console.log(err);
                            },
                            success: function(builds) {
                                angular.forEach(builds, function(build) {
                                    if(!!build.get('finished')) {
                                        build.set('finished', new Date(build.get('finished')));
                                    } else {
                                        build.set('finished', 'in Progress');
                                    }
                                    build.set('started', new Date(build.get('started')));
                                });

                                builds.sort(function(a, b) {
                                    return a.get('started').getTime() < b.get('started').getTime();
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

            $scope.build = function() {
                var project = new Project({
                    '_id': $scope.projectId
                });

                project.fetch({
                    error: function(model, err, options) {
                        console.log(err);
                    },
                    success: function(project, response, options) {
                        var workingCopy = Project.getWorkingCopy(project, $scope.version);
                        var buildJob = new BuildJob({
                            'projectId': $scope.projectId,
                            'workingCopyName': workingCopy.name,
                            'workingCopyType': workingCopy.type,
                            'workingCopyRev': workingCopy.rev,
                            'service': $scope.service,
                            'environment': $scope.environment
                        });
                        buildJob.save({
                            success: update
                        });
                    }
                });
            };

            $scope.upload = function() {
                var project = new Project({
                    '_id': $scope.projectId
                });

                project.fetch({
                    error: function(model, err, options) {
                        console.log(err);
                    },
                    success: function(project, response, options) {
                        new Dialog('#dialog', 'UploadDialogCtrl', 'app/widgets/upload-dialog.tpl.html', {
                            'project': project,
                            'version': $scope.version,
                            'service': $scope.service,
                            'environment': $scope.environment
                        });
                    }
                });
            };

            $scope.openDialog = function(build) {
                new Dialog('#dialog', 'BuildOutputDialogCtrl', 'app/widgets/build-output-dialog.tpl.html', {
                    build: build
                });
            };

        }]
    };

}]);

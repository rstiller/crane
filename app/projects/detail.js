
angular.module('dashboard.controllers').controller('ProjectDetailCtrl',
    ['$scope', '$stateParams', 'Project', 'BuildJob', 'Dialog', 'RenderPipeline',
    function($scope, $stateParams, Project, BuildJob, Dialog, RenderPipeline) {

    $scope.data = {
        selectedEnvironment: '',
        selectedVersion: {},
        selectedVersionName: '',
        versions: [],
        environments: [],
        services: [],
        ready: false,
        project: null
    };

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        var project = new Project({
            '_id': $stateParams.projectId
        });

        project.fetch({
            error: function(model, err, options) {
                console.log(err);
            },
            success: function(project, response, options) {
                $scope.data.project = project;

                var versions = {};
                var workingCopy = null;

                angular.forEach(project.get('branches'), function(branch, branchName) {
                    versions[branchName] = branch;
                    if(branchName === 'master') {
                        $scope.data.selectedVersion = branch;
                    }
                });
                angular.forEach(project.get('tags'), function(tag, tagName) {
                    versions[tagName] = tag;
                });

                if(!!$scope.data.selectedVersion.infrastructure) {
                    $scope.data.services = $scope.data.selectedVersion.infrastructure.services;
                }

                $scope.data.versions = versions;
                $scope.data.ready = true;
                $scope.$apply();

                next();
            }
        });
    });

    $scope.$watch('data.selectedVersion', function(selectedVersion) {
        angular.forEach($scope.data.versions, function(version, name) {
            if(selectedVersion._rev === version._rev) {
                $scope.data.selectedVersionName = name;
            }
        });
    });

    $scope.selectEnvironment = function(environment) {
        $scope.data.selectedEnvironment = environment;
    };

    $scope.$watch('data.selectedVersion', function() {
        var environments = [];

        if(!!$scope.data.selectedVersion.infrastructure) {
            angular.forEach($scope.data.selectedVersion.infrastructure.environments, function(variables, name) {
                environments.push(name);
            });
        }

        environments.sort();

        $scope.data.environments = environments;
        if(!!environments[0]) {
            $scope.data.selectedEnvironment = environments[0];
        }
    });

    var generateBuildJobs = function(buildJobs, project, workingCopy, name, type, selectedEnvironment) {
        var infrastructure = workingCopy.infrastructure;
        angular.forEach(infrastructure.environments, function(variables, environment) {
            if(!selectedEnvironment || selectedEnvironment === environment) {
                angular.forEach(infrastructure.services, function(config, service) {
                    var buildJob = new BuildJob({
                        'projectId': project.get('_id'),
                        'workingCopyName': name,
                        'workingCopyType': type,
                        'workingCopyRev': workingCopy.rev,
                        'service': service,
                        'environment': environment
                    });
                    buildJobs.push(buildJob);
                });
            }
        });
    };

    var build = function(version, environment) {
        var buildJobs = [];
        var project = $scope.data.project;

        angular.forEach(project.get('branches'), function(branch, name) {
            if(!version || name === version) {
                generateBuildJobs(buildJobs, project, branch, name, Project.WORKING_COPY_TYPE.BRANCH, environment);
            }
        });
        angular.forEach($scope.data.project.get('tags'), function(tag, name) {
            if(!version || name === version) {
                generateBuildJobs(buildJobs, project, tag, name, Project.WORKING_COPY_TYPE.TAG, environment);
            }
        });

        BuildJob.saveAll(buildJobs, function(err) {
            renderPipeline.push({});
        });
    };

    $scope.buildProject = function() {
        build();
    };

    $scope.buildVersion = function(version) {
        build(version);
    };

    $scope.buildEnvironment = function(version, environment) {
        build(version, environment);
    };

    $scope.setBuildTags = function(event) {
        $scope.data.project.set('buildTags', event.target.checked);
        $scope.data.project.save();
    };

    $scope.deployVersion = function(version) {
        new Dialog('#dialog', 'DeployDialogCtrl', 'app/widgets/deploy-dialog.tpl.html', {
            'project': $scope.data.project,
            'version': version
        });
    };

    $scope.deployEnvironment = function(version, environment) {
        new Dialog('#dialog', 'DeployDialogCtrl', 'app/widgets/deploy-dialog.tpl.html', {
            'project': $scope.data.project,
            'version': version,
            'environment': environment
        });
    };
    
    $scope.deploymentHistory = function() {
    	new Dialog('#dialog', 'DeployHistoryDialogCtrl', 'app/widgets/deploy-history-dialog.tpl.html', {
            'project': $scope.data.project
        });
    };

    $scope.chooseBranches = function() {
        new Dialog('#dialog', 'ChooseBranchesCtrl', 'app/projects/choose-branches-dialog.tpl.html', {
            url: $scope.data.project.get('url'),
            branches: $scope.data.project.get('branches'),
            saveCallback: function(branches) {
                var projectBranches = $scope.data.project.get('branches');

                angular.forEach(branches, function(branch, name) {
                    if(!projectBranches[name]) {
                        projectBranches[name] = branch;
                    }
                });
                angular.forEach(projectBranches, function(branch, name) {
                    if(!branches[name]) {
                        delete projectBranches[name];
                    }
                });

                $scope.data.project.set('branches', projectBranches);
                $scope.data.project.save({
                    success: function() {
                        renderPipeline.push({});
                    }
                });
            }
        });
    };

    renderPipeline.push({});

}]);

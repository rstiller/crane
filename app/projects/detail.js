
angular.module('dashboard.controllers').controller('ProjectDetailCtrl',
    ['$scope', '$stateParams', 'ProjectEntity', 'RenderPipeline',
    function($scope, $stateParams, ProjectEntity, RenderPipeline) {

    $scope.data = {};
    $scope.data.selectedEnvironment = '';
    $scope.data.selectedVersion = {};
    $scope.data.versions = [];
    $scope.data.environments = [];
    $scope.data.services = [];
    $scope.data.ready = false;
    $scope.data.project = null;

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        ProjectEntity.get($stateParams.projectId, function(err, project) {
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

    ProjectEntity.addChangeListener(function(err, project) {
        if(!!err) {
            return;
        }

        if(project.get('_id') === $stateParams.projectId) {
            renderPipeline.push({});
        }
    });

    renderPipeline.push({});

}]);

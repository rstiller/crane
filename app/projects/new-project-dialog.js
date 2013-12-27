
angular.module('dashboard.controllers').controller('NewProjectCtrl',
    ['$scope', 'Hoster', 'Project',
    function($scope, Hoster, Project) {

    $scope.project = {};
    $scope.branches = [];
    $scope.cssClass = 'new-project-dialog';
    $scope.buildTags = true;
    $scope.buildBranches = [];

    $scope.init = function() {

        Hoster.get($scope.url).getRepositoryInfo($scope.url, function(err, info) {
            $scope.project = info;
            if(!!info.description && !!info.description.length > 0) {
                $scope.cssClass = "new-project-dialog-with-description";
            }
            $scope.$apply();
        });

        Hoster.get($scope.url).getBranches($scope.url, function(err, branches) {
            $scope.branches = branches;

            angular.forEach(branches, function(branch) {
                if(branch.name == 'master') {
                    $scope.buildBranches = [branch];
                }
            });

            $scope.$apply();
        });

    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveProject = function() {

        var branches = {};

        angular.forEach($scope.buildBranches, function(branch) {
            branches[branch.name] = {
                _rev: ''
            };
        });

        var project = new Project({
            'name': $scope.project.name,
            'url': $scope.project.html_url,
            'buildTags': $scope.buildTags,
            'branches': branches
        });

        project.save({
            error: function(model, err, options) {
                console.log(err);
            },
            success: function(model, response, options) {
                if($scope.saveCallback) {
                    $scope.saveCallback();
                }
                $scope.$parent.close();
            }
        });

    };

}]);

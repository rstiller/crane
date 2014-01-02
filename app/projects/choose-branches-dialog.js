
angular.module('dashboard.controllers').controller('ChooseBranchesCtrl',
    ['$scope', 'Hoster', 'Project',
    function($scope, Hoster, Project) {

    $scope.data = {
        selectedBranches: [],
        ready: false
    };
    $scope.cssClass = 'choose-branches-dialog';

    $scope.init = function() {
        Hoster.get($scope.url).getBranches($scope.url, function(err, branches) {
            $scope.data.branches = branches;
            $scope.data.ready = true;

            angular.forEach($scope.branches, function(branch, name) {
                angular.forEach($scope.data.branches, function(branch) {
                    if(branch.name === name) {
                        $scope.data.selectedBranches.push(branch);
                    }
                });
            });

            $scope.$apply();
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveBranches = function() {
        var branches = {};

        angular.forEach($scope.data.selectedBranches, function(branch) {
            branches[branch.name] = {
                rev: ''
            };
        });

        if(!!$scope.saveCallback) {
            $scope.saveCallback(branches);
        }

        $scope.closeDialog();
    };

}]);

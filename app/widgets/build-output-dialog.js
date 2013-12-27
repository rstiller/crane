
angular.module('dashboard.widgets').controller('BuildOutputDialogCtrl',
    ['$scope', function($scope) {

    $scope.cssClass = 'build-output-dialog';
    $scope.data = {};
    $scope.data.ready = false;

    $scope.$watch('build', function(build) {
        build.getCommands({
            error: function(err) {
                console.log(err);
            },
            success: function(commands) {
                angular.forEach(commands, function(command) {
                    command.collapsed = true;
                });
                $scope.data.commands = commands;
                $scope.data.ready = true;
                $scope.$apply();
            }
        });
    });

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

}]);

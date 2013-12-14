
angular.module('dashboard.controllers').controller('MachineMenuCtrl',
    ['$scope', 'Dialog',
    function($scope, Dialog) {

    $scope.data = {};
    $scope.data.ready = true;
    $scope.data.groups = ['', ''];

    $scope.openNewGroupDialog = function() {
        new Dialog('#dialog', 'NewGroupCtrl', 'app/machines/new-group-dialog.tpl.html', {
            saveCallback: function() {
            }
        });
    };

    $scope.openNewMachineDialog = function() {
        new Dialog('#dialog', 'NewMachineCtrl', 'app/machines/new-machine-dialog.tpl.html', {
            saveCallback: function() {
            }
        });
    };

}]);

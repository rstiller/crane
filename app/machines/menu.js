
angular.module('dashboard.controllers').controller('MachineMenuCtrl',
    ['$scope', 'Dialog',
    function($scope, Dialog) {

    $scope.data = {};
    $scope.data.ready = true;
    $scope.data.groups = ['', ''];

    $scope.openNewMachineDialog = function() {
        new Dialog('#dialog', 'NewMachineCtrl', 'app/machines/new-machine-dialog.tpl.html', {
            saveCallback: function() {
            }
        });
    };

}]);

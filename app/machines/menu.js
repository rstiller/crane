
angular.module('dashboard.controllers').controller('MachineMenuCtrl',
    ['$scope',
    function($scope) {

    $scope.data = {};
    $scope.data.ready = true;
    $scope.data.groups = ['', ''];

}]);

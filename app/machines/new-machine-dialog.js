
angular.module('dashboard.controllers').controller('NewMachineCtrl',
    ['$scope', 'MachineEntity',
    function($scope, MachineEntity) {

    $scope.data = {
        'startIp1': '',
        'startIp2': '',
        'startIp3': '',
        'startIp4': '',
        'endIp4': '',
        'type': MachineEntity.Type.DOCKER,
        'username': 'docker',
        'password': '',
        'types': [MachineEntity.Type.DOCKER, MachineEntity.Type.LXC]
    };
    $scope.cssClass = 'new-machine-dialog';

    $scope.init = function() {
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveMachines = function() {
        var machines = [];

        if(!!$scope.data.endIp4) {
            var range = $scope.data.endIp4 - $scope.data.startIp4;

            for(var i = 0; i <= range; i++) {
                machines.push(new MachineEntity({
                    address: $scope.data.startIp1 + '.' + $scope.data.startIp2 + '.' + $scope.data.startIp3 + '.' + (parseInt($scope.data.startIp4) + i),
                    username: $scope.data.username,
                    password: $scope.data.password,
                    type: $scope.data.type
                }));
            }
        } else {
            machines.push(new MachineEntity({
                address: $scope.data.startIp1 + '.' + $scope.data.startIp2 + '.' + $scope.data.startIp3 + '.' + $scope.data.startIp4,
                username: $scope.data.username,
                password: $scope.data.password,
                type: $scope.data.type
            }));
        }
        MachineEntity.saveAll(machines, function(err) {
            if(!!err) {
                console.log(err);
                return;
            }

            $scope.closeDialog();
        });
    };

}]);

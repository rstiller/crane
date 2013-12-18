
angular.module('dashboard.controllers').controller('NewMachineCtrl',
    ['$scope', 'MachineEntity', 'MachineGroupEntity',
    function($scope, MachineEntity, MachineGroupEntity) {

    $scope.data = {
        startIp1: '',
        startIp2: '',
        startIp3: '',
        startIp4: '',
        endIp4: '',
        type: MachineEntity.Type.DOCKER,
        username: 'docker',
        password: '',
        types: [MachineEntity.Type.DOCKER, MachineEntity.Type.LXC],
        ready: false,
        selectedGroups: [],
        newGroupName: ''
    };
    $scope.cssClass = 'new-machine-dialog';

    var getMachines = function() {
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

        return machines;
    };

    $scope.init = function() {
        $scope.data.ready = false;
        MachineGroupEntity.all(function(err, groups) {
            $scope.data.groups = groups;
            $scope.data.ready = true;
            $scope.$apply();
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveMachines = function() {
        var machines = getMachines();

        MachineEntity.saveAll(machines, function(err, machines) {
            if(!!err) {
                console.log(err);
                return;
            }

            var machineIds = [];

            angular.forEach(machines, function(machine) {
                machineIds.push(machine.get('_id'));
            });

            if(!!$scope.data.newGroupName) {
                new MachineGroupEntity({
                    name: $scope.data.newGroupName,
                    machines: machineIds
                }).update();
            }

            if($scope.data.selectedGroups.length > 0) {
                angular.forEach($scope.data.selectedGroups, function(group) {
                    angular.forEach(machineIds, function(machineId) {
                        group.get('machines').push(machineId);
                    });
                    group.update();
                });
            }

            $scope.closeDialog();
            $scope.$apply();
        });
    };

}]);

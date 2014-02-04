
angular.module('dashboard.controllers').controller('NewMachineCtrl',
    ['$scope', 'Machine', 'MachineGroup', 'async',
    function($scope, Machine, MachineGroup, async) {

    $scope.data = {
        addressType: 'hostname',
        hostname: '',
        startIp1: '',
        startIp2: '',
        startIp3: '',
        startIp4: '',
        endIp4: '',
        runtime: Machine.RUNTIME.DOCKER,
        username: 'docker',
        password: '',
        port: 22,
        runtimes: [Machine.RUNTIME.DOCKER, Machine.RUNTIME.LXC],
        ready: false,
        selectedGroups: [],
        groups: [],
        newGroupName: ''
    };
    $scope.cssClass = 'new-machine-dialog';

    var getMachines = function() {
        var machines = [];

        if($scope.data.addressType === 'hostname') {
            machines.push(new Machine({
                address: $scope.data.hostname,
                username: $scope.data.username,
                password: $scope.data.password,
                port: $scope.data.port,
                runtime: $scope.data.runtime
            }));
        } else if($scope.data.addressType === 'ip') {
            if(!!$scope.data.endIp4) {
                var range = $scope.data.endIp4 - $scope.data.startIp4;

                for(var i = 0; i <= range; i++) {
                    machines.push(new Machine({
                        address: $scope.data.startIp1 + '.' + $scope.data.startIp2 + '.' + $scope.data.startIp3 + '.' + (parseInt($scope.data.startIp4) + i),
                        username: $scope.data.username,
                        password: $scope.data.password,
                        port: $scope.data.port,
                        runtime: $scope.data.runtime
                    }));
                }
            } else {
                machines.push(new Machine({
                    address: $scope.data.startIp1 + '.' + $scope.data.startIp2 + '.' + $scope.data.startIp3 + '.' + $scope.data.startIp4,
                    username: $scope.data.username,
                    password: $scope.data.password,
                    port: $scope.data.port,
                    runtime: $scope.data.runtime
                }));
            }
        }

        return machines;
    };

    $scope.changeAddressType = function(value) {
        $scope.data.addressType = value;
    };

    $scope.$watch('data.addressType', function(value) {
        $scope.element.find('.hostname-fieldset').attr('disabled', value === 'ip' ? 'disabled' : null);
        $scope.element.find('.ip-fieldset').attr('disabled', value === 'hostname' ? 'disabled' : null);
    });

    $scope.init = function() {
        $scope.data.ready = false;
        MachineGroup.all({
            success: function(groups) {
                $scope.data.groups = groups;
                $scope.data.ready = true;
                $scope.$apply();
            }
        });
    };

    $scope.closeDialog = function() {
        $scope.$parent.close();
    };

    $scope.saveMachines = function() {
        var machines = getMachines();
        var tasks = [];
        var groups = [];

        if(!!$scope.data.newGroupName) {
            tasks.push(function(next) {
                var group = new MachineGroup({
                    name: $scope.data.newGroupName,
                    machines: machines
                });
                group.save({
                    success: function() {
                        next(null);
                    }
                });
            });
        }

        angular.forEach($scope.data.selectedGroups, function(group) {
            groups.push(group);
        });

        angular.forEach(groups, function(group) {
            tasks.push(function(next) {
                var oldMachines = group.get('machines') || [];
                angular.forEach(machines, function(machine) {
                    oldMachines.push(machine);
                });
                group.set('machines', oldMachines);
                group.save({
                    error: function(model, err) {
                        next(err);
                    },
                    success: function() {
                        next(null);
                    }
                });
            });
        });

        async.series(tasks, function(err) {
            if(!!err) {
                console.log(err);
                return;
            }

            $scope.closeDialog();
            if(!!$scope.saveCallback) {
                $scope.saveCallback(machines, groups);
            }
            $scope.$apply();
        });
    };

}]);


angular.module('dashboard.controllers').controller('MachineMenuCtrl',
    ['$rootScope', '$scope', 'Dialog', 'MachineGroupEntity', 'MachineEntity', 'RenderPipeline', 'async',
    function($rootScope, $scope, Dialog, MachineGroupEntity, MachineEntity, RenderPipeline, async) {

    $scope.data = {};
    $scope.data.ready = false;
    $scope.data.groups = null;
    $scope.data.machines = {};

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        MachineGroupEntity.all(function(err, groups) {
            if(!!err) {
                console.log(err);
                return;
            }

            angular.forEach(groups, function(group) {
                refreshGroup(group);
            });

            $scope.data.groups = groups;
            $scope.data.ready = true;
            $scope.$apply();

            next();
        });
    });

    var refreshGroup = function(group) {
        MachineEntity.forGroup(group, function(err, machines) {
            $scope.data.machines[group.get('_id')] = machines;
            $scope.$apply();
        });
    };

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

    $scope.removeGroup = function(group) {
        group.remove(function(err) {
            if(!!err) {
                console.log(err);
                return;
            }

            delete $scope.data.machines[group.get('_id')];
            renderPipeline.push({});
        });
    };

    $scope.removeMachine = function(group, machine) {
        var dialog = new Dialog('#dialog', 'RemoveMachineCtrl', 'app/machines/remove-machine-dialog.tpl.html', {
            removeMachine: function() {
                MachineGroupEntity.all(function(err, groups) {
                    var funcs = [];

                    angular.forEach(groups, function(group) {
                        funcs.push(function(next) {
                            group.removeMachine(machine, function(err) {
                                next(null);
                            });
                        });
                    });

                    async.series(funcs, function(err) {
                        dialog.close();
                    });
                });
            },
            removeFromGroup: function() {
                group.removeMachine(machine, function(err) {
                    dialog.close();
                });
            }
        });
    };

    $rootScope.$on('groups.update', function(event, group) {
        refreshGroup(group);
    });

    $rootScope.$on('machines.update', function(event, machine) {
        var affectedGroups = [];

        if(!!$scope.data.groups) {
            angular.forEach($scope.data.groups, function(group) {
                angular.forEach(group.get('machines'), function(machineId) {
                    if(machine.get('_id') === machineId) {
                        affectedGroups.push(group);
                    }
                });
            });
        }

        angular.forEach(affectedGroups, function(group) {
            refreshGroup(group);
        });
    });

    renderPipeline.push({});

}]);


angular.module('dashboard.controllers').controller('MachineMenuCtrl',
    ['$rootScope', '$scope', 'Dialog', 'MachineGroup', 'Machine', 'RenderPipeline', 'async',
    function($rootScope, $scope, Dialog, MachineGroup, Machine, RenderPipeline, async) {

    $scope.data = {};
    $scope.data.ready = false;
    $scope.data.groups = null;

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        MachineGroup.all({
            error: function(model, err) {
                console.log(err);
            },
            success: function(groups) {
                $scope.data.groups = groups;
                $scope.data.ready = true;
                $scope.$apply();

                next();
            }
        });
    });
    
    $rootScope.$on('groups.update', function(event, groups) {
        renderPipeline.push({});
    });

    $scope.openNewGroupDialog = function() {
        new Dialog('#dialog', 'NewGroupCtrl', 'app/machines/new-group-dialog.tpl.html', {
            saveCallback: function(group) {
            	$rootScope.$emit('groups.update', [group]);
            }
        });
    };

    $scope.openNewMachineDialog = function() {
        new Dialog('#dialog', 'NewMachineCtrl', 'app/machines/new-machine-dialog.tpl.html', {
            saveCallback: function(machines, groups) {
            	$rootScope.$emit('groups.update', groups);
            }
        });
    };

    $scope.removeGroup = function(group) {
        group.destroy({
            error: function(model, err, options) {
                console.log(err);
            },
            success: function(model, response, options) {
                renderPipeline.push({});
            }
        });
    };

    renderPipeline.push({});

}]);

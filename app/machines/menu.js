
angular.module('dashboard.controllers').controller('MachineMenuCtrl',
    ['$rootScope', '$scope', 'Dialog', 'MachineGroupEntity', 'RenderPipeline',
    function($rootScope, $scope, Dialog, MachineGroupEntity, RenderPipeline) {

    $scope.data = {};
    $scope.data.ready = false;
    $scope.data.groups = null;

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        MachineGroupEntity.all(function(err, groups) {
            if(!!err) {
                console.log(err);
                return;
            }

            $scope.data.groups = groups;
            $scope.data.ready = true;
            $scope.$apply();

            next();
        });
    });

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

    $scope.remove = function(group) {
        group.remove(function(err) {
            if(!!err) {
                console.log(err);
                return;
            }

            renderPipeline.push({});
        });
    };

    $rootScope.$on('groups.update', function(event, project) {
        renderPipeline.push({});
    });

    renderPipeline.push({});

}]);


angular.module('dashboard.controllers').controller('GroupDetailCtrl',
    ['$scope', '$stateParams', 'MachineGroup', 'RenderPipeline',
    function($scope, $stateParams, MachineGroup, RenderPipeline) {

    $scope.data = {
        ready: false,
        group: null
    };

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        var group = new MachineGroup({
            '_id': $stateParams.groupId
        });

        group.fetch({
            error: function(model, err, options) {
                console.log(err);
            },
            success: function(group, response, options) {
                $scope.data.group = group;
                $scope.data.ready = true;
                $scope.$apply();

                next();
            }
        });
    });

    renderPipeline.push({});

}]);

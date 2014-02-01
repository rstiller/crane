
angular.module('dashboard.controllers').controller('GroupDetailCtrl',
    ['$scope', '$stateParams', 'jquery', 'MachineGroup', 'RenderPipeline',
    function($scope, $stateParams, $, MachineGroup, RenderPipeline) {

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
    
    MachineGroup.addChangeListener({
    	success: function() {
    		renderPipeline.push({});
    	}
    });
    
    $scope.selectAll = function($event) {
    	var thisCheckbox = $($event.target);
    	var table = thisCheckbox.parents('table');
    	var checkboxes = table.find('tbody tr td input[type=checkbox]');
    	var selectedCheckboxes = table.find('tbody tr td input:checked');
    	
    	checkboxes.prop('checked', selectedCheckboxes.length < checkboxes.length && thisCheckbox.is(':checked'));
    };
    
    $scope.checkSelectAll = function($event) {
    	var table = $($event.target).parents('table');
    	var checkbox = table.find('thead tr th input[type=checkbox]');
    	var checkboxes = table.find('tbody tr td input[type=checkbox]');
    	var selectedCheckboxes = table.find('tbody tr td input:checked');
    	
    	checkbox.prop('checked', selectedCheckboxes.length >= checkboxes.length);
    };

    renderPipeline.push({});

}]);

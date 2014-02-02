
angular.module('dashboard.controllers').controller('GroupDetailCtrl',
    ['$scope', '$stateParams', 'jquery', '_', 'MachineGroup', 'Dialog', 'RenderPipeline',
    function($scope, $stateParams, $, _, MachineGroup, Dialog, RenderPipeline) {

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
    	
    	selectedCheckboxes = table.find('tbody tr td input:checked');
    	$('.group-detail-header button').prop('disabled', selectedCheckboxes.length > 0 ? null : 'disabled');
    };
    
    $scope.checkSelectAll = function($event) {
    	var table = $($event.target).parents('table');
    	var checkbox = table.find('thead tr th input[type=checkbox]');
    	var checkboxes = table.find('tbody tr td input[type=checkbox]');
    	var selectedCheckboxes = table.find('tbody tr td input:checked');
    	var enabled = selectedCheckboxes.length >= checkboxes.length;
    	
    	$('.group-detail-header button').prop('disabled', selectedCheckboxes.length > 0 ? null : 'disabled');
    	checkbox.prop('checked', enabled);
    };
    
    $scope.removeMachines = function($event) {
    	var machines = [];
    	
    	$('.group-detail table tbody tr td input[type=checkbox]:checked').each(function() {
    		machines.push(parseInt($(this).attr('data-index')));
    	});
    	
    	var newMachines = _.difference($scope.data.group.get('machines'), _.values(_.pick($scope.data.group.get('machines'), machines)));
    	
    	$scope.data.group.set('machines', newMachines);
    	$scope.data.group.save(function() {
    		renderPipeline.push({});
    	});
    };
    
    $scope.manageUploads = function($event) {
    	var machines = [];
    	
    	$('.group-detail table tbody tr td input[type=checkbox]:checked').each(function() {
    		machines.push(parseInt($(this).attr('data-index')));
    	});
    	
    	new Dialog('#dialog', 'ManageUploadsCtrl', 'app/machines/manage-uploads-dialog.tpl.html', {
    		group: $scope.data.group,
    		machines:  _.values(_.pick($scope.data.group.get('machines'), machines))
        });
    };

    renderPipeline.push({});

}]);

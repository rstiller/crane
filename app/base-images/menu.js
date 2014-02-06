
angular.module('dashboard.controllers').controller('BaseImagesMenuCtrl',
	['$rootScope', '$scope', '$location', 'BaseImages', 'Dialog', 'Registry',
	function($rootScope, $scope, $location, BaseImages, Dialog, Registry) {
    
    $scope.data = {};
    $scope.data.baseImages = [];
    $scope.data.pullBaseImage = {
        'name': ''
    };
    
    $scope.refresh = function() {
        
        BaseImages.query({}, function(baseImages) {
            $scope.data.baseImages = baseImages;
        });
        
    };
    
    $scope.pullImage = function() {
        BaseImages.pull({
            'id': $scope.data.pullBaseImage.name
        }, function() {
            $scope.data.pullBaseImage.name = '';
            $scope.refresh();
        });
    };
    
    $scope.openDialog = function() {
        new Dialog('#dialog', 'BaseImagesFormCtrl', 'app/base-images/base-image-dialog.tpl.html', {
        });
    };
    
    $scope.remove = function(id) {
        BaseImages.remove({ 'id': id }, function() {
            $scope.refresh();
        });
        
        if($rootScope.$stateParams.baseImageId == id) {
            $location.path('/base-images/');
        }
    };
    
    $scope.refresh();
    
    new Registry({
    	username: 'user',
    	password: 'password',
    	namespace: 'user'
    }).ping({
    	success: function(data) {
    		console.log(data);
    	}
    });
    
}]);

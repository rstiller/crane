
angular.module('dashboard.controllers').controller('BaseImagesMenuCtrl', ['$rootScope', '$scope', '$location', 'BaseImages',
                                                                          function($rootScope, $scope, $location, BaseImages) {
    
    $scope.data = {};
    $scope.data.baseImages = [];
    $scope.data.pullBaseImage = {
        'name': ''
    };
    
    var refresh = function() {
        
        BaseImages.query({}, function(baseImages) {
            $scope.data.baseImages = baseImages;
        });
        
    };
    
    $scope.pullImage = function() {
        BaseImages.pull({
            'id': $scope.data.pullBaseImage.name
        }, function() {
            $scope.data.pullBaseImage.name = '';
            refresh();
        });
    };
    
    $scope.openDialog = function() {
    };
    
    $scope.remove = function(id) {
        BaseImages.remove({ 'id': id }, function() {
            refresh();
        });
        
        if($rootScope.$stateParams.baseImageId == id) {
            $location.path('/base-images/');
        }
    };
    
    refresh();
    
}]);

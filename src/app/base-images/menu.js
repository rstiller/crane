
angular.module('dashboard.controllers').controller('BaseImagesMenuCtrl', ['$rootScope', '$scope', '$location', 'BaseImages', 'DockerUtil', 'Dialog',
                                                                          function($rootScope, $scope, $location, BaseImages, DockerUtil, Dialog) {
    
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
    
    $scope.url = function(name) {
        return DockerUtil.indexUrl(name);
    };
    
    $scope.refresh();
    
}]);

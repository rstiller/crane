
angular.module('dashboard.controllers').controller('BaseImagesDetailCtrl', ['$scope', '$stateParams', 'BaseImages', 'DockerUtil',
                                                                            function($scope, $stateParams, BaseImages, DockerUtil) {
    
    $scope.data = {};
    
    $scope.url = function() {
        
        if(!$scope.data.baseImage || !$scope.data.baseImage.name) {
            return '';
        }
        
        return DockerUtil.indexUrl($scope.data.baseImage.name);
        
    };
    
    BaseImages.get({
        'id': $stateParams.baseImageId
    }, function(baseImage) {
        $scope.data.baseImage = baseImage;
    });
    
}]);

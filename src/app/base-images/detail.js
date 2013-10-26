
angular.module('dashboard.controllers').controller('BaseImagesDetailCtrl', ['$scope', '$stateParams', 'BaseImages',
                                                                            function($scope, $stateParams, BaseImages) {
    
    $scope.data = {};
    
    BaseImages.get({
        'id': $stateParams.baseImageId
    }, function(baseImage) {
        
        $scope.data.baseImage = baseImage;
        
    });
    
}]);


angular.module('dashboard.controllers').controller('BaseImagesDetailCtrl', ['$scope', '$stateParams', 'BaseImages',
                                                                            function($scope, $stateParams, BaseImages) {
    
    $scope.data = {};
    
    $scope.url = function() {
        
        if(!$scope.data.baseImage || !$scope.data.baseImage.name) {
            return '';
        }
        
        var name = $scope.data.baseImage.name;
        
        if(name.indexOf('/') === -1) {
            return 'https://index.docker.io/_/' + name;
        } else {
            return 'https://index.docker.io/u/' + name;
        }
    };
    
    BaseImages.get({
        'id': $stateParams.baseImageId
    }, function(baseImage) {
        $scope.data.baseImage = baseImage;
    });
    
}]);

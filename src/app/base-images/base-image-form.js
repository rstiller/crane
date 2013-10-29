
angular.module('dashboard.controllers').controller('BaseImagesFormCtrl', ['$scope', '$templateCache', 'BaseImages',
                                                                          function($scope, $templateCache, BaseImages) {
    
    $scope.data = {};
    $scope.data.baseImage = {};
    $scope.data.packages = [];
    $scope.data.packagesOptions = {
        dataSource: [
            {
                'name': 'ruby1.9.1',
                'version': 'asd'
            },{
                'name': 'puppet-common',
                'version': '2.7.19'
            }
        ],
        template: kendo.template($templateCache.get('app/base-images/base-image-package-item.tpl.html')),
        editTemplate: kendo.template($templateCache.get('app/base-images/base-image-package-edit.tpl.html'))
    };
    $scope.cssClass = "new-base-image-dialog";
    
    $scope.$parent.$watch('data.baseImage', function(baseImage) {
        $scope.data.baseImage = baseImage;
    });
    
    if(!!$scope.$parent && !!$scope.$parent.data && !!$scope.$parent.data.baseImage) {
        $scope.data.baseImage = $scope.$parent.data.baseImage;
    }
    
    $scope.refresh = function() {
        if(!!$scope.$parent && !!$scope.$parent.refresh) {
            $scope.$parent.refresh();
        }
    };
    
    $scope.closeDialog = function() {
        $scope.$parent.close();
    };
    
    $scope.addPackage = function() {
        list = $('.package-list').data('kendoListView');
        list.add();
        console.log(list);
    };
    
    $scope.saveBaseImage = function() {
        
        if(!!$scope.data.baseImage.id) {
            
            $scope.data.baseImage.packages = $scope.data.packages;
            $scope.data.baseImage.$update({
                'id': $scope.data.baseImage.id
            }, function() {
                $scope.refresh();
            });
            
        } else {
            
            BaseImages.save({
                'type': 'custom',
                'name': $scope.data.baseImage.name,
                'version': $scope.data.baseImage.version,
                'provision': $scope.data.baseImage.provision,
                'provisionVersion': $scope.data.baseImage.provisionVersion,
                'baseImage': $scope.data.baseImage.baseImage,
                'packages': $scope.data.packages
            }, function() {
                $scope.closeDialog();
                $scope.refresh();
            });
            
        }
        
    };
    
}]);

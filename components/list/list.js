
var list = angular.module('components.list');

list.directive('list', ['$compile', '$templateCache', '$timeout', function listFactory($compile, $templateCache, $timeout) {
    
    return {
        replace: true,
        require: 'ngModel',
        scope: {},
        templateUrl: 'components/list/list.tpl.html',
        link: function($scope, element, attributes, ngModel) {
            
            var nameField = $(element).find('.package-list input[name="name"]');
            var versionField = $(element).find('.package-list input[name="version"]');
            
            $scope.data = $scope.data || {};
            $scope.data.editVisible = false;
            $scope.data.items = [];
            
            ngModel.$render = function() {
                $scope.data.items = ngModel.$viewValue;
            };
            
            $scope.showEditAndFocus = function($event) {
                $scope.data.editVisible = true;
                $timeout(function () {
                    nameField.get()[0].focus();
                });
            };
            
            $scope.remove = function($event, $index) {
                $scope.data.items.splice($index, 1);
                ngModel.$setViewValue($scope.data.items);
            };
            
            $scope.hideEdit = function() {
                nameField.val('');
                versionField.val('');
                $scope.data.editVisible = false;
            };
            
            $scope.saveNewPackage = function() {
                $scope.data.items.push({
                    'name': nameField.val(),
                    'version': versionField.val()
                });
                ngModel.$setViewValue($scope.data.items);
                $scope.hideEdit();
            };
            
        }
    };
    
}]);

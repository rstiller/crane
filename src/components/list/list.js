
var list = angular.module('components.list');

list.directive('list', ['$compile', '$templateCache', function listFactory($compile, $templateCache) {
    
    return {
        replace: true,
        require: 'ngModel',
        scope: {},
        templateUrl: 'components/list/list.tpl.html',
        link: function($scope, element, attributes, ngModel) {
            $scope.data = $scope.data || {};
            
            $scope.$parent.$watch(attributes.ngModel, function(value) {
                $scope.data.items = value;
            });
        },
        controller: ['$scope', function($scope) {
        }]
    };
    
}]);

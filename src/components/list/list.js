
var list = angular.module('components.list');

list.directive('list', ['$compile', '$templateCache', function listFactory($compile, $templateCache) {
    
    return {
        replace: true,
        require: 'ngModel',
        scope: false,
        templateUrl: 'components/list/list.tpl.html',
        link: function($scope, element, attributes, ngModel) {
            $scope.data = $scope.data || {};
            $scope.data.items = ngModel;
        },
        controller: ['$scope', function($scope) {
        }]
    };
    
}]);

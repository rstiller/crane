
var dialog = angular.module('components.dialog');

dialog.directive('dialog', ['$compile', '$templateCache', function dialogFactory($compile, $templateCache) {
    
    return {
        replace: true,
        scope: {
            template: '@template',
            controller: '@dialog'
        },
        templateUrl: 'components/dialog/dialog.tpl.html',
        link: function($scope, element, attributes, controller) {
            var templateHtml = $templateCache.get(attributes.template);
            var html = '<div class="pure-dialog-content" ng-controller="' + attributes.dialog + '">' + templateHtml + '</div>';
            var content = $compile(html)($scope);
            element.find('.pure-dialog-container').html(content);
        },
        controller: ['$scope', function($scope) {
            $scope.$watch('controller', function() {
                $scope.open();
            });
            $scope.close = function() {
                $scope.visibility = 'hidden';
            };
            $scope.open = function() {
                $scope.visibility = 'visible';
            };
        }]
    };
    
}]);

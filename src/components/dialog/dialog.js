
var dialog = angular.module('components.dialog');

dialog.factory('Dialog', function() {
    
    function Dialog(selector, controller, template, initArguments) {
        var dialog = $(selector);
        dialog.scope().initArguments = initArguments;
        dialog.attr('template', template);
        dialog.attr('dialog', controller);
    }
    
    return Dialog;
    
});

dialog.directive('dialog', ['$compile', '$templateCache', function dialogFactory($compile, $templateCache) {
    
    return {
        replace: true,
        scope: {
            template: '@template',
            controller: '@dialog'
        },
        templateUrl: 'components/dialog/dialog.tpl.html',
        link: function($scope, element, attributes, controller) {
            
            var renderDialog = function(controller, template, initArguments) {
                
                var templateHtml = $templateCache.get(template);
                var html = '<div class="pure-dialog-content" ng-controller="' + controller + '">' + templateHtml + '</div>';
                
                if(!!controller && controller.length > 0 && !!templateHtml && templateHtml.length > 0) {
                    var content = $compile(html)($scope);
                    if(!!initArguments) {
                        angular.forEach(initArguments, function(value, key) {
                            content.scope()[key] = value;
                        });
                    }
                    if(!!content.scope().init) {
                        content.scope().init();
                    }
                    element.find('.pure-dialog-container').html(content);
                }
                
            };
            
            var observeAttribute = function() {
                
                renderDialog($scope.controller, $scope.template, $scope.$parent.initArguments);
                
                if(!!$scope.controller && $scope.controller.length > 0 && !!$scope.template && $scope.template.length > 0) {
                    $scope.open();
                } else {
                    $scope.close();
                }
                
            };
            
            $scope.$watch(function() { return element.attr('dialog'); }, function(value) {
                $scope.controller = value;
                observeAttribute();
            });
            
            $scope.$watch(function() { return element.attr('template'); }, function(value) {
                $scope.template = value;
                observeAttribute();
            });
            
            renderDialog($scope.controller, $scope.template, $scope.$parent.initArguments);
            
        },
        controller: ['$scope', function($scope) {
            
            $scope.close = function() {
                $scope.visibility = 'hidden';
            };
            
            $scope.open = function() {
                $scope.visibility = 'visible';
            };
            
        }]
    };
    
}]);


var dialog = angular.module('components.dialog');

dialog.factory('Dialog', function() {

    function Dialog(selector, controller, template, initArguments) {

        var slf = this;
        var dialog = $(selector);
        dialog.scope().initArguments = initArguments;
        dialog.scope().initArguments['_dialog'] = this;
        dialog.attr({
            'data-template': template,
            'dialog': controller
        });

        this.close = function() {
            slf.instance.close();
        };

    }

    return Dialog;

});

dialog.directive('dialog', ['$compile', '$templateCache', function dialogFactory($compile, $templateCache) {

    return {
        replace: false,
        scope: {
            template: '@template',
            controller: '@dialog'
        },
        templateUrl: 'components/dialog/dialog.tpl.html',
        link: function($scope, element, attributes, controller) {

            var renderDialog = function(controller, template, initArguments) {

                var templateHtml = $templateCache.get(template);
                var html = '<div class="pure-dialog-content {{ cssClass }}" ng-controller="' + controller + '">' + templateHtml + '</div>';

                if(!!controller && controller.length > 0 && !!templateHtml && templateHtml.length > 0) {
                    var content = $compile(html)($scope);
                    if(!!initArguments) {
                        angular.forEach(initArguments, function(value, key) {
                            if(key !== '_dialog') {
                                content.scope()[key] = value;
                            }
                        });
                    }
                    initArguments['_dialog'].instance = content.scope();
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
                } else if($scope.visibility == 'visible') {
                    $scope.close();
                }

            };

            $scope.element = element;
            $scope.visibility = 'hidden';

            $scope.$watch(function() { return element.attr('dialog'); }, function(value) {
                $scope.controller = value;
                observeAttribute();
            });

            $scope.$watch(function() { return element.attr('data-template'); }, function(value) {
                $scope.template = value;
                observeAttribute();
            });

            renderDialog($scope.controller, $scope.template, $scope.$parent.initArguments);

        },
        controller: ['$scope', function($scope) {

            $scope.close = function() {
                $scope.visibility = 'hidden';
                $scope.element.find('.pure-dialog-container').html('');
                $scope.element.attr({
                    'data-template': '',
                    'dialog': ''
                });
            };

            $scope.open = function() {
                $scope.visibility = 'visible';
            };

            $scope.closeOnOutsideClick = function() {
                $scope.close();
            };

            $scope.disarmOutsideClick = function($event) {
                $event.stopPropagation();
                return false;
            };

        }]
    };

}]);


var focus = angular.module('components.focus');

focus.directive('focus', function focusFactory() {
    
    return {
        link: function($scope, element, attributes, controller) {
            element[0].focus();
            console.log(element, element[0]);
        }
    };
    
});

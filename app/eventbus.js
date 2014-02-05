
angular.module('dashboard.eventbus').factory('EventBus', ['$rootScope', function($rootScope) {

    return $rootScope.$new(true);

}]);

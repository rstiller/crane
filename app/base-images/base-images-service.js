
angular.module('dashboard.services').factory('BaseImages', function($resource) {
    
    return $resource('/api/baseImages/:id', { 'id': '' }, {
        'query': { method: 'GET', isArray: false },
        'update': { method: 'PUT' },
        'create': { method: 'POST' },
        'pull': { method: 'POST', url: '/api/baseImages/pull' },
        'build': { method: 'PUT', url: '/api/baseImages/:id/build' }
    });
    
});

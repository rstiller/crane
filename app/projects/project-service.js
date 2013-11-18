
angular.module('dashboard.services').factory('Projects', function($resource) {
    
    return $resource('/api/projects/:id', { 'id': '' },{
        'query': { method: 'GET', isArray: false },
        'update': { method: 'PUT' },
        'create': { method: 'POST' }
    });
    
});

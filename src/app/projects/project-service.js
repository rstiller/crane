
angular.module('dashboard.services').factory('Projects', function($resource) {
    
    return $resource('/api/projects/:id', {
        'id': ''
    },{
        'get': {
            method:'GET'
        },
        'update': {
            method:'PUT'
        },
        'new': {
            method: 'POST'
        },
        'query': {
            method: 'GET',
            isArray: true
        },
        'remove': {
            method: 'DELETE'
        },
        'delete': {
            method: 'DELETE'
        }
    });
    
});

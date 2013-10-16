
angular.module('dashboard.services').factory('GithubProjectCache', ['$http', function($http) {
    
    var cache = {};
    
    return {
        
        clear: function(project) {
            
            delete cache[project.id];
            
        },
        
        get: function(project, callback) {
            
            if(!!cache[project.id]) {
                
                callback(cache[project.id]);
                
            } else {
                
                var repo = project.url.split('https://github.com/')[1];
                
                $http.jsonp('https://api.github.com/repos/' + repo + '?callback=JSON_CALLBACK').success(function(response) {
                    
                    cache[project.id] = response.data;
                    callback(cache[project.id]);
                    
                });
                
            }
            
        }
        
    };
    
}]);

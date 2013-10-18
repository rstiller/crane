
angular.module('dashboard.services').factory('Cache', ['$http', function($http) {
    
    var cache = {};
    
    function Cache() {
        
        this.clear = function(key) {
            delete cache[key];
        };
        
        this.get = function(key, callback) {
            
            if(!!cache[key]) {
                
                callback(cache[key]);
                
            } else {
                
                var repo = key.split('github.com/')[1];
                this.getRaw('https://api.github.com/repos/' + repo, callback);
                
            }
            
        };
        
        this.getRaw = function(key, callback) {
            
            if(!!cache[key]) {
                
                callback(cache[key]);
                
            } else {
                
                $http.jsonp(key + '?callback=JSON_CALLBACK').success(function(response) {
                    
                    cache[key] = response.data;
                    callback(cache[key]);
                    
                });
                
            }
            
        };
        
    };
    
    return new Cache();
    
}]);

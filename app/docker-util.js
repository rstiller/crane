
angular.module('dashboard.utils').factory('DockerUtil', [function() {
    
    function DockerUtil() {
        
        this.indexUrl = function(repository) {
            
            if(!repository) {
                return '';
            }
            
            if(repository.indexOf('/') === -1) {
                return 'https://index.docker.io/_/' + repository;
            } else {
                return 'https://index.docker.io/u/' + repository;
            }
            
        };
        
    };
    
    return new DockerUtil();
    
}]);

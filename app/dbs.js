
angular.module('dashboard.dbs').factory('DBS', ['PouchDB', '$location', function(PouchDB, $location) {
    
    var opts = {
        continuous: true
    };
    var db = function(name) {
        var url = 'http://' + $location.host() +':9000/' + name;
        var database = new PouchDB(url);
        
        return database;
    };
    
    return {
        'Projects': db('projects'),
        'Machines': db('machines'),
        'Commands': db('commands'),
        'Builds': db('builds'),
        'BuildLogs': db('build-logs')
    };
    
}]);

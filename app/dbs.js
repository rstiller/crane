
angular.module('dashboard.dbs').factory('DBS',
    ['PouchDB', '$location', '$rootScope', function(PouchDB, $location, $rootScope) {
    
    var opts = {
        continuous: true
    };
    var db = function(name) {
        var url = 'http://' + $location.host() +':9000/' + name;
        var database = new PouchDB(url);
        
        return database;
    };
    
    var dbs = {
        'Projects': db('projects'),
        'Machines': db('machines'),
        'Commands': db('commands'),
        'Builds': db('builds'),
        'BuildLogs': db('build-logs')
    };
    
    dbs.Projects.changes({
        continuous: true,
        include_docs: true,
        onChange: function(change) {
            $rootScope.$broadcast('projects.update', change.doc);
        }
    });
    
    return dbs;
    
}]);

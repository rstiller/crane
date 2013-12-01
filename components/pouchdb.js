
angular.module('components.pouchdb').factory('PouchDB', [function() {
    
    PouchDB.enableAllDbs = true;
    return PouchDB;
    
}]);


angular.module('dashboard.dbs').factory('DBS',
    ['PouchDB', '$location', '$rootScope',
    function(PouchDB, $location, $rootScope) {

    return {
        'DB': new PouchDB($location.protocol() + '://' + $location.host() +':9000/crane')
    };

}]);

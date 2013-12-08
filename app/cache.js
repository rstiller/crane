
angular.module('dashboard.cache').factory('Cache', ['$http', 'PouchDB', function($http, PouchDB) {

    function Cache(name) {

        var slf = this;

        this.store = new PouchDB(name);

        this.get = function(key, callback) {
            var date = new Date();

            slf.store.get(key, function(err, doc) {
                if(!!err) {
                    callback(err);
                    return;
                }

                if(doc.expiration < date.getTime()) {
                    callback({
                        err: 404,
                        reason: 'expired'
                    });
                    return;
                }

                callback(null, doc.value);
            });
        };

        this.put = function(key, value, options, callback) {

            if(!callback) {
                callback = options;
            }

            slf.remove(key, function(err) {
                slf.store.post({
                    _id: key,
                    expiration: new Date().getTime() + (options.expire || Cache.DEFAULT_EXPIRATION),
                    value: value
                }, function(err) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    callback();
                });
            });
        };

        this.remove = function(key, callback) {
            slf.store.remove(key, function(err, response) {
                if(!!err) {
                    callback(err);
                    return;
                }

                if(!!callback) {
                    callback(null);
                }
            });
        };

    }

    // one day expiration time
    Cache.DEFAULT_EXPIRATION = 24 * 60 * 60 * 1000 * 1;

    return Cache;

}]);

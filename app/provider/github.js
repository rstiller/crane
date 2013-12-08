
angular.module('dashboard.provider').factory('Github', ['Hoster', '$http', 'async', 'Cache', function(Hoster, $http, async, Cache) {

    function Github() {

        var slf = this;

        this.cache = new Cache('github');
        this.queue = async.queue(function(task, callback) {

            slf.cache.get(task.url, function(err, value) {
                if(!!err) {
                    slf.doRequest(task.url, function(err, response) {
                        slf.cache.put(task.url, response, function(err) {
                            callback(null, response);
                        });
                    });
                    return;
                }

                callback(null, value);
            });

        }, 1);

        this.doRequest = function(url, callback) {
            $http.jsonp(url + '?callback=JSON_CALLBACK').success(function(response, status, headers, config) {
                callback(null, response.data);
            }).error(function() {
                callback({
                    data: data,
                    status: status,
                    headers: headers,
                    config: config
                });
            });
        };

        this.getId = function() {
            return 'github.com'
        };

        this.getRepositoryImageUrl = function(url, callback) {
            slf.getRepositoryInfo(url, function(err, data) {
                if(!!err) {
                    callback(err);
                    return;
                }

                callback(null, data.owner.avatar_url);
            });
        };

        this.getRepositoryInfo = function(url, callback) {
            var repo = url.split('github.com/')[1];

            slf.queue.push({
                url: 'https://api.github.com/repos/' + repo
            }, function(err, info) {
                if(!!err) {
                    callback(err);
                    return;
                }

                callback(null, info);
            });
        };

        this.getBranches = function(url, callback) {
            slf.getRepositoryInfo(url, function(err, data) {
                slf.queue.push({
                    url: data.branches_url.replace('{/branch}', '')
                }, function(err, branches) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    callback(null, branches);
                });
            });
        };

        this.clearCache = function(url) {
            slf.cache.remove(url);
        };

        Hoster.register(slf);

    }

    return new Github();

}]);


angular.module('dashboard.provider').factory('Github', ['Hoster', '$http', 'async', function(Hoster, $http, async) {

    function Github() {

        var slf = this;

        this.queue = async.queue(function(task, callback) {

            slf.doRequest(task.url, function(err, response) {
                callback(null, response);
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

        this.clearCache = function() {
            // TODO
        };

        Hoster.register(slf);

    }

    return new Github();

}]);

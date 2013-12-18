
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var DBS = null;

    function Factory() {

        return BaseEntity.extend({
            defaults: {
                output: [],
                exitCode: -1,
                cmd: '',
                started: null,
                finished: null,
                enabled: false
            },
            updateOut: function(data) {
                this.get('output').push({
                    'type': 'out',
                    'data': data
                });
                this.update();
            },
            updateErr: function(data) {
                this.get('output').push({
                    'type': 'err',
                    'data': data
                });
                this.update();
            },
            update: function(callback) {
                var slf = this;

                if(slf.get('enabled') === true) {
                    slf.updateQueue.push({}, function (err) {
                        if(!!err) {
                            callback(err);
                            return;
                        }

                        if(!!callback) {
                            callback(null, slf);
                        }
                    });
                } else {
                    if(!!callback) {
                        callback(null, slf);
                    }
                }
            }
        }, {
            db: DBS.BuildLogs,
            forBuild: function(build, callback) {
                var slf = this;
                var funcs = [];

                _.each(build.logs, function(logId) {
                    funcs.push(function(next) {
                        slf.db.get(logId, function(err, log) {
                            if(!!err) {
                                next(err);
                                return;
                            }

                            next(null, log);
                        });
                    });
                });

                async.series(funcs, function(err, logs) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    if(!!callback) {
                        callback(null, logs);
                    }
                });
            }
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity');
        DBS = require('../lib/dbs');

        module.exports.BuildLog = Factory();
    } else {
        angular.module('shared.entities').factory('BuildLogEntity', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

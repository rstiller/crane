
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var DBS = null;

    function Factory() {

        var Status = {
            CREATED: 'created',
            STARTED: 'started',
            FINISHED: 'finished'
        };

        return BaseEntity.extend({
            defaults: {
                projectId: '',
                workingCopyName: '',
                workingCopyType: '',
                workingCopyRev: '',
                service: '',
                environment: '',
                status: '',
                created: new Date(),
                started: null,
                finished: null,
                successful: false,
                logs: []
            },
            start: function() {
                this.set('status', Status.STARTED);
                this.set('started', new Date());
            },
            finish: function() {
                this.set('status', Status.FINISHED);
                this.set('finished', new Date());
            },
            addBuildLog: function(buildLog) {
                this.get('logs').push(buildLog._id);
            }
        }, {
            db: DBS.Builds,
            Status: Status,
            forProject: function(projectId, version, service, environment, callback) {
                var slf = this;
                var db = slf.db;

                db.query({
                    map: function(doc) {
                        emit(null, doc);
                    }
                }, {
                    reduce: false
                }, function(err, docs) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    var builds = [];

                    _.each(docs.rows, function(doc) {
                        var build = slf.fromJson(doc.value);

                        if( build.projectId === projectId &&
                            build.workingCopyRev === version &&
                            build.service === service &&
                            build.environment === environment) {
                            builds.push(build);
                        }
                    });

                    if(!!callback) {
                        callback(null, builds);
                    }
                })
            },
            saveAll: function(builds, callback) {
                var slf = this;
                var db = slf.constructor.db;

                db.bulkDocs({
                    'docs': builds
                }, function(err) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    if(!!callback) {
                        callback(null);
                    }
                });
            }
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        DBS = require('../lib/dbs');

        module.exports.Build = Factory();
    } else {
        angular.module('shared.entities').factory('BuildEntity', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

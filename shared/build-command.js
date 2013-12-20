
(function() {

    var _ = null;
    var async = null;
    var Command = null;
    var DBS = null;

    function Factory() {

        return Command.extend({
            defaults: {
                projectId: '',
                workingCopyName: '',
                workingCopyType: '',
                workingCopyRev: '',
                service: '',
                environment: '',
                type: 'build-command'
            }
        }, {
            TYPE: 'build-command',
            forProject: function(projectId, version, service, environment, callback) {
                var slf = this;
                var db = slf.DB;

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
                var db = slf.DB;

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
        Command = require('./command').Command;
        DBS = require('../lib/dbs');

        module.exports.BuildCommand = Factory();
    } else {
        angular.module('shared.entities').factory('BuildCommand', ['_', 'async', 'Command', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            Command = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

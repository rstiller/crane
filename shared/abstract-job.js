
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var ShellCommand = null;
    var DBS = null;

    function Factory() {

        var Status = {
            CREATED: 'created',
            STARTED: 'started',
            FINISHED: 'finished'
        };

        return BaseEntity.extend({
            defaults: _.extend({}, BaseEntity.prototype.defaults, {
                status: Status.CREATED,
                created: new Date(),
                started: null,
                finished: null,
                successful: false
            }),
            start: function() {
                this.set('status', Status.STARTED);
                this.set('started', new Date());
            },
            finish: function() {
                this.set('status', Status.FINISHED);
                this.set('finished', new Date());
            },
            newShellCommand: function(attributes) {
                return new ShellCommand(_.extend({}, attributes, {
                    jobId: this.get('_id')
                }));
            },
            getCommands: function(options) {
                var slf = this;
                var clazz = slf.constructor;
                var query = clazz.query;

                query.apply(clazz, [_.extend({}, options, {
                    params: {
                        job_id: '"' + slf.get('_id') + '"',
                        include_docs: true
                    },
                    filter: 'commands',
                    success: function(response) {
                        var objects = [];

                        _.each(response.results, function(result) {
                            objects.push(new ShellCommand(result.doc));
                        });

                        if(!!options && !!options.success) {
                            options.success(objects);
                        }
                    }
                })]);
            }
        }, {
            STATUS: Status
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        ShellCommand = require('./shell-command').ShellCommand;
        DBS = require('../lib/dbs');

        module.exports.AbstractJob = Factory();
    } else {
        angular.module('shared.entities').factory('AbstractJob', ['_', 'async', 'BaseEntity', 'ShellCommand', 'DBS', function(a, b, c, d, e) {
            _ = a;
            async = b;
            BaseEntity = c;
            ShellCommand = d;
            DBS = e;

            return Factory();
        }]);
    }

})();

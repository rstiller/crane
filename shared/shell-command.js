
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var DBS = null;
    var spawn = null;

    function Factory() {

        return BaseEntity.extend({
            defaults: _.extend({}, BaseEntity.prototype.defaults, {
                output: [],
                exitCode: -1,
                cmd: '',
                args: '',
                cwd: '',
                started: null,
                finished: null,
                jobId: null,
                enabled: false,
                type: 'shell-command'
            }),
            start: function(options) {
                var slf = this;

                if(!!spawn) {
                    slf.set('started', new Date());
                    slf.process = spawn(slf.get('cmd'), slf.get('args'), {
                        'cwd': slf.get('cwd') || '.'
                    });

                    slf.process.stdout.setEncoding('utf8');
                    slf.process.stdout.on('data', function(data) {
                        slf.get('output').push({
                            'type': 'out',
                            'data': data
                        });
                        if(slf.get('enabled') === true) {
                            slf.save();
                        }

                        if(!!options && !!options.out) {
                            options.out(data);
                        }
                    });

                    slf.process.stderr.setEncoding('utf8');
                    slf.process.stderr.on('data', function(data) {
                        slf.get('output').push({
                            'type': 'err',
                            'data': data
                        });
                        if(slf.get('enabled') === true) {
                            slf.save();
                        }

                        if(!!options && !!options.err) {
                            options.err(data);
                        }
                    });

                    slf.process.on('close', function(code) {
                        slf.set({
                            'exitCode': code,
                            'finished': new Date()
                        });
                        if(slf.get('enabled') === true) {
                            slf.save();
                        }

                        if(!!options && !!options.done) {
                            options.done(code);
                        }
                    });

                    slf.process.on('error', function() {
                        if(!!options && !!options.err) {
                            options.err(data);
                        }
                    });
                }
            }
        }, {
            TYPE: 'shell-command'
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        DBS = require('../lib/dbs');
        spawn = require('child_process').spawn;

        module.exports.ShellCommand = Factory();
    } else {
        angular.module('shared.entities').factory('ShellCommand', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

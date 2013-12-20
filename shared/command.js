
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
                status: '',
                created: new Date(),
                started: null,
                finished: null,
                successful: false,
                logs: [],
                type: 'command'
            },
            start: function() {
                this.set('status', Status.STARTED);
                this.set('started', new Date());
            },
            finish: function() {
                this.set('status', Status.FINISHED);
                this.set('finished', new Date());
            },
            addLog: function(log) {
                this.get('logs').push(log._id);
            }
        }, {
            TYPE: 'command',
            STATUS: Status
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        DBS = require('../lib/dbs');

        module.exports.Command = Factory();
    } else {
        angular.module('shared.entities').factory('Command', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

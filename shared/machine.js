
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var DBS = null;

    function Factory() {

        var Runtime = {
            LXC: 'lxc',
            DOCKER: 'docker'
        };

        return BaseEntity.extend({
            defaults: _.extend({}, BaseEntity.prototype.defaults, {
                address: '',
                username: '',
                password: '',
                groups: [],
                runtime: Runtime.DOCKER,
                type: 'machine'
            }),
            countGroups: function(options) {
                var slf = this;
                var clazz = slf.constructor;
                var query = clazz.query;

                query.apply(clazz, [_.extend({}, options, {
                    params: {
                        key: '"' + slf.get('_id') + '"',
                        group: true
                    },
                    view: 'count-groups'
                })]);
            }
        }, {
            TYPE: 'machine',
            RUNTIME: Runtime
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        DBS = require('../lib/dbs');

        module.exports.Machine = Factory();
    } else {
        angular.module('shared.entities').factory('Machine', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

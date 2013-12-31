
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var Machine = null;

    function Factory() {

        return BaseEntity.extend({
            defaults: _.extend({}, BaseEntity.prototype.defaults, {
                machines: [],
                description: '',
                name: '',
                type: 'machine-group'
            }),
            removeMachine: function(index, callback) {
                var slf = this;
                var machines = slf.get('machines');

                machines[index] = null;

                slf.set('machines', _.compact(machines));
            }
        }, {
            TYPE: 'machine-group'
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        Machine = require('./machine').Machine;

        module.exports.MachineGroup = Factory();
    } else {
        angular.module('shared.entities').factory('MachineGroup', ['_', 'async', 'BaseEntity', 'DBS', 'Machine', function(a, b, c, d, e) {
            _ = a;
            async = b;
            BaseEntity = c;
            Machine = e;

            return Factory();
        }]);
    }

})();


(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var DBS = null;

    function Factory() {

        return BaseEntity.extend({
            defaults: {
                machines: [],
                description: '',
                name: '',
                type: 'machine-group'
            },
            removeMachine: function(machine, callback) {
                var slf = this;

                slf.constructor.countGroupsForMachine(machine, function(err, count) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    var machines = [];

                    _.each(slf.get('machines'), function(id) {
                        if(machine.get('_id') !== id) {
                            machines.push(id);
                        }
                    });
                    slf.set('machines', machines);

                    slf.save({
                        success: function() {
                            if(count <= 1) {
                                machine.destroy({
                                    error: function(model, err, options) {
                                        callback(err);
                                    },
                                    success: function(model, response, options) {
                                        if(!!callback) {
                                            callback(null, slf);
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            }
        }, {
            TYPE: 'machine-group',
            countGroupsForMachine: function(machine, callback) {
                var count = 0;

                this.all(function(err, groups) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    _.each(groups, function(group) {
                        var index = _.indexOf(group.get('machines'), machine.get('_id'));
                        if(index !== -1) {
                            count++;
                        }
                    });

                    callback(null, count);
                });
            }
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        BaseEntity = require('./base-entity').BaseEntity;
        DBS = require('../lib/dbs');

        module.exports.MachineGroup = Factory();
    } else {
        angular.module('shared.entities').factory('MachineGroup', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();


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
                name: ''
            },
            removeMachine: function(machine, callback) {
                var slf = this;

                this.countGroupsForMachine(machine, function(err, count) {
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

                    slf.update(function(err, group) {
                        if(count <= 1) {
                            machine.remove(function(err) {
                                if(!!err) {
                                    callback(err);
                                    return;
                                }

                                if(!!callback) {
                                    callback(null, slf);
                                }
                            });
                        }
                    });
                });
            }
        }, {
            db: DBS.MachineGroups,
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
        BaseEntity = require('./base-entity');
        DBS = require('../lib/dbs');

        module.exports.MachineGroup = Factory();
    } else {
        angular.module('shared.entities').factory('MachineGroupEntity', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

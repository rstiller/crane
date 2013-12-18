
(function() {

    var _ = null;
    var async = null;
    var BaseEntity = null;
    var DBS = null;

    function Factory() {

        var Type = {
            LXC: 'lxc',
            DOCKER: 'docker'
        };

        return BaseEntity.extend({
            defaults: {
                address: '',
                username: '',
                password: '',
                type: Type.DOCKER
            }
        }, {
            db: DBS.Machines,
            Type: Type,
            forGroup: function(group, callback) {
                var funcs = [];
                var slf = this;

                _.each(group.get('machines'), function(machineId) {
                    funcs.push(function(next) {
                        var machine = new (slf)({
                            '_id': machineId
                        });

                        machine.fetch({
                            error: function(model, err, options) {
                                next(err);
                            },
                            success: function(model, response, options) {
                                next(null, model);
                            }
                        });
                    });
                });

                async.series(funcs, function(err, machines) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    if(!!callback) {
                        callback(null, machines);
                    }
                });
            },
            saveAll: function(machines, callback) {
                var slf = this;
                var db = slf.db;

                db.bulkDocs({
                    'docs': machines
                }, function(err, response) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    _.each(machines, function(machine, index) {
                        machine.set('_id', response[index].id);
                        machine.set('_rev', response[index].rev);
                    });

                    if(!!callback) {
                        callback(null, machines);
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

        module.exports.Machine = Factory();
    } else {
        angular.module('shared.entities').factory('MachineEntity', ['_', 'async', 'BaseEntity', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            BaseEntity = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

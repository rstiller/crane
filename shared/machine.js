
(function() {

    var _ = null;
    var async = null;
    var DBS = null;

    function Machine(options) {

        var slf = this;
        var updateQueue = async.queue(function(task, callback) {
            var method = !!slf._id ? DBS.Machines.put : DBS.Machines.post;
            method(slf, function(err, response) {
                if(!!err) {
                    callback(err);
                    return;
                }

                slf._id = response.id;
                slf._rev = response.rev;

                callback();
            });
        }, 1);

        this.address = '';
        this.username = '';
        this.password = '';
        this.type = Machine.Type.DOCKER;

        _.extend(slf, options);

        this.update = function(callback) {
            updateQueue.push({}, function() {
                if(!!callback) {
                    callback(slf);
                }
            });
        };

        this.remove = function(callback) {
            DBS.Machines.remove(slf, function(err, response) {
                if(!!err) {
                    callback(err);
                    return;
                }

                if(!!callback) {
                    callback(null);
                }
            });
        };

    }

    Machine.addChangeListener = function(callback) {
        DBS.Machines.changes({
            continuous: true,
            onChange: function(change) {
                Machine.get(change.id, function(err, machine) {
                    if(!!callback) {
                        callback(err, machine);
                    }
                });
            }
        });
    };

    Machine.get = function(id, callback) {
        DBS.Machines.get(id, function(err, machine) {
            if(!!err) {
                callback(err);
                return;
            }

            if(!!callback) {
                callback(null, Machine.fromJson(machine));
            }
        });
    };

    Machine.all = function(callback) {
        DBS.Machines.allDocs({
            include_docs: true
        }, function(err, docs) {
            if(!!err) {
                callback(err);
                return;
            }

            var machines = [];
            _.each(docs.rows, function(row) {
                machines.push(Machine.fromJson(row.doc));
            });

            if(!!callback) {
                callback(null, machines);
            }
        });
    };

    Machine.forGroup = function(group, callback) {
        var funcs = [];

        _.each(group.machines, function(machineId) {
            funcs.push(function(next) {
                DBS.Machines.get(machineId, function(err, machine) {
                    if(!!err) {
                        next(err);
                        return;
                    }

                    next(null, Machine.fromJson(machine));
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
    };

    Machine.saveAll = function(machines, callback) {
        DBS.Machines.bulkDocs({
            'docs': machines
        }, function(err, response) {
            if(!!err) {
                callback(err);
                return;
            }

            _.each(machines, function(machine, index) {
                machine._id = response[index].id;
                machine._rev = response[index].rev;
            });

            if(!!callback) {
                callback(null, machines);
            }
        });
    };

    Machine.fromJson = function(json) {
        var machine = new Machine();
        _.extend(machine, json);
        return machine;
    };

    Machine.Type = {};
    Machine.Type.LXC = 'lxc';
    Machine.Type.DOCKER = 'docker';

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        DBS = require('../lib/dbs');
        module.exports.Machine = Machine;
    } else {
        angular.module('shared.entities').factory('MachineEntity', ['_', 'async', 'DBS', function(a, b, c) {
            _ = a;
            async = b;
            DBS = c;
            return Machine;
        }]);
    }

})();


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
                    callback();
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

    Machine.saveAll = function(machines, callback) {
        DBS.Machines.bulkDocs({
            'docs': machines
        }, function(err) {
            if(!!err) {
                callback(err);
                return;
            }

            if(!!callback) {
                callback();
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

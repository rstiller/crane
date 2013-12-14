
(function() {

    var _ = null;
    var async = null;
    var DBS = null;

    function MachineGroup(options) {

        var slf = this;
        var updateQueue = async.queue(function(task, callback) {
            var method = !!slf._id ? DBS.MachineGroups.put : DBS.MachineGroups.post;
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

        this.machines = [];
        this.description = '';
        this.name = '';

        _.extend(slf, options);

        this.update = function(callback) {
            updateQueue.push({}, function() {
                if(!!callback) {
                    callback();
                }
            });
        };

        this.remove = function(callback) {
            DBS.MachineGroups.remove(slf, function(err, response) {
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

    MachineGroup.addChangeListener = function(callback) {
        DBS.MachineGroups.changes({
            continuous: true,
            onChange: function(change) {
                MachineGroup.get(change.id, function(err, machineGroup) {
                    if(!!callback) {
                        callback(err, machineGroup);
                    }
                });
            }
        });
    };

    MachineGroup.get = function(id, callback) {
        DBS.MachineGroups.get(id, function(err, machineGroup) {
            if(!!err) {
                callback(err);
                return;
            }

            if(!!callback) {
                callback(null, MachineGroup.fromJson(machineGroup));
            }
        });
    };

    MachineGroup.all = function(callback) {
        DBS.MachineGroups.allDocs({
            include_docs: true
        }, function(err, docs) {
            if(!!err) {
                callback(err);
                return;
            }

            if(!!callback) {
                var machineGroups = [];
                _.each(docs.rows, function(row) {
                    machineGroups.push(MachineGroup.fromJson(row.doc));
                });
                callback(null, machineGroups);
            }
        });
    };

    MachineGroup.fromJson = function(json) {
        var machineGroup = new MachineGroup();
        _.extend(machineGroup, json);
        return machineGroup;
    };

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        DBS = require('../lib/dbs');
        module.exports.MachineGroup = MachineGroup;
    } else {
        angular.module('shared.entities').factory('MachineGroupEntity', ['_', 'async', 'DBS', function(a, b, c) {
            _ = a;
            async = b;
            DBS = c;
            return MachineGroup;
        }]);
    }

})();

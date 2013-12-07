
(function() {
    
    var _ = null;
    var async = null;
    var DBS = null;
    
    function BuildLog(cmd) {
        
        var slf = this;
        var updateQueue = async.queue(function(task, callback) {
            var method = !!slf._id ? DBS.BuildLogs.put : DBS.BuildLogs.post;
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
        
        this.output = [];
        this.exitCode = -1;
        this.cmd = cmd;
        this.started = null;
        this.finished = null;
        this.enabled = false;
        
        this.updateOut = function(data) {
            slf.output.push({
                'type': 'out',
                'data': data
            });
            slf.update();
        };
        
        this.updateErr = function(data) {
            slf.output.push({
                'type': 'err',
                'data': data
            });
            slf.update();
        };
        
        this.update = function(callback) {
            if(slf.enabled === true) {
                updateQueue.push({}, function (err) {
                    if(!!err) {
                        callback(err);
                        return;
                    }
                    
                    if(!!callback) {
                        callback();
                    }
                });
            } else {
                if(!!callback) {
                    callback();
                }
            }
        };
        
    }
    
    BuildLog.forBuild = function(build, callback) {
        var funcs = [];
        
        _.each(build.logs, function(logId) {
            funcs.push(function(next) {
                DBS.BuildLogs.get(logId, function(err, log) {
                    if(!!err) {
                        next(err);
                        return;
                    }
                    
                    next(null, log);
                });
            });
        });
        
        async.series(funcs, function(err, logs) {
            if(!!err) {
                callback(err);
                return;
            }
            
            if(!!callback) {
                callback(null, logs);
            }
        });
    };
    
    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        DBS = require('../lib/dbs');
        module.exports.BuildLog = BuildLog;
    } else {
        angular.module('shared.entities').factory('BuildLogEntity', ['_', 'async', 'DBS', function(a, b, c) {
            _ = a;
            async = b;
            DBS = c;
            return BuildLog;
        }]);
    }
    
})();

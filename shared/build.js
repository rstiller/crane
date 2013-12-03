
(function() {
    
    var _ = null;
    var async = null;
    var DBS = null;
    
    function Build(projectId, workingCopyName, workingCopyType, service, environment) {
        
        var slf = this;
        var updateQueue = async.queue(function(task, callback) {
            var method = !!slf._id ? DBS.Builds.put : DBS.Builds.post;
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
        
        this.projectId = projectId;
        this.workingCopyName = workingCopyName;
        this.workingCopyType = workingCopyType;
        this.service = service;
        this.environment = environment;
        this.status = Build.Status.CREATED;
        this.created = new Date();
        this.started = null;
        this.finished = null;
        this.successful = false;
        this.logs = [];
        
        this.start = function() {
            slf.status = Build.Status.STARTED;
            slf.started = new Date();
        };
        
        this.finish = function() {
            slf.status = Build.Status.FINISHED;
            slf.finished = new Date();
        };
        
        this.addBuildLog = function(buildLog) {
            slf.logs.push(buildLog._id);
        };
        
        this.toJson = function() {
            return {
                'projectId': slf.projectId,
                'workingCopyName': slf.workingCopyName,
                'workingCopyType': slf.workingCopyType,
                'service': slf.service,
                'environment': slf.environment,
                'status': slf.status,
                'created': slf.created,
                'started': slf.started,
                'finished': slf.finished,
                'successful': slf.successful,
                'logs': slf.logs
            };
        };
        
        this.update = function(callback) {
            updateQueue.push({}, function(err) {
                if(!!err) {
                    callback(err);
                    return;
                }
                
                if(!!callback) {
                    callback();
                }
            });
        };
        
    }
    
    Build.addChangeListener = function(callback) {
        DBS.Builds.changes({
            continuous: true,
            onChange: function(change) {
                Build.get(change.id, function(build) {
                    if(!!callback) {
                        callback(build);
                    }
                });
            }
        });
    };
    
    Build.get = function(id, callback) {
        DBS.Builds.get(id, function(err, build) {
            if(!!err) {
                callback(err);
                return;
            }
            
            if(!!callback) {
                callback(null, Build.fromJson(build));
            }
        });
    };
    
    Build.saveAll = function(builds, callback) {
        DBS.Builds.bulkDocs({
            'docs': builds
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
    
    Build.fromJson = function(json) {
        var build = new Build(
            json.projectId,
            json.workingCopyName,
            json.workingCopyType,
            json.service,
            json.environment
        );
        _.extend(build, json);
        return build;
    };
    
    Build.Status = {};
    Build.Status.CREATED = 'created';
    Build.Status.STARTED = 'started';
    Build.Status.FINISHED = 'finished';
    
    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        DBS = require('../lib/dbs');
        module.exports.Build = Build;
    } else {
        angular.module('shared.entities').factory('Build', ['_', 'async', 'dbs', function(a, b, c) {
            _ = a;
            async = b;
            DBS = c;
            return Build;
        }]);
    }
    
})();


var async = require('async');
var LOG = require('winston');

var DBS = require('../dbs');

function BuildLog(cmd) {
    
    var slf = this;
    var updateQueue = async.queue(function(task, callback) {
        var method = !!slf._id ? DBS.BuildLogs.put : DBS.BuildLogs.post;
        method(slf, function(err, response) {
            if(!!err) {
                LOG.error(err);
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
                    LOG.error(err);
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

module.exports.BuildLog = BuildLog;

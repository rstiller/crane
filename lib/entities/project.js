
var _ = require('underscore');
var async = require('async');
var LOG = require('winston');

var DBS = require('../dbs');

function Project() {
    
    var slf = this;
    var updateQueue = async.queue(function(task, callback) {
        var method = !!slf._id ? DBS.Projects.put : DBS.Projects.post;
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
    
    this.branches = null;
    this.name = '';
    this.tags = null;
    this.url = '';
    
    this.update = function(callback) {
        updateQueue.push({}, function() {
            if(!!callback) {
                callback();
            }
        });
    };
    
}

Project.forEach = function(callback) {
    DBS.Projects.query({
        'map': function(doc) {
            emit(doc, null);
        }
    }, {
        'reduce': false
    }, function(err, docs) {
        if(!!err) {
            LOG.error(err);
            return;$
        }
        
        _.each(docs.rows, function(doc) {
            callback(Project.fromJson(doc.key));
        });
    });
};

Project.get = function(id, callback) {
    DBS.Projects.get(id, function(err, project) {
        if(!!err) {
            LOG.error(err);
            return;
        }
        
        if(!!callback) {
            callback(Project.fromJson(project));
        }
    });
};

Project.fromJson = function(json) {
    var project = new Project();
    _.extend(project, json);
    return project;
};

module.exports.Project = Project;

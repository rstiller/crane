
(function() {
    
    var _ = null;
    var async = null;
    var DBS = null;
    
    function Project() {
        
        var slf = this;
        var updateQueue = async.queue(function(task, callback) {
            var method = !!slf._id ? DBS.Projects.put : DBS.Projects.post;
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
                callback(err);
                return;
            }
            
            _.each(docs.rows, function(doc) {
                callback(null, Project.fromJson(doc.key));
            });
        });
    };
    
    Project.get = function(id, callback) {
        DBS.Projects.get(id, function(err, project) {
            if(!!err) {
                callback(err);
                return;
            }
            
            if(!!callback) {
                callback(null, Project.fromJson(project));
            }
        });
    };
    
    Project.fromJson = function(json) {
        var project = new Project();
        _.extend(project, json);
        return project;
    };
    
    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        DBS = require('../lib/dbs');
        module.exports.Project = Project;
    } else {
        angular.module('shared.entities').factory('Project', ['_', 'async', 'dbs', function(a, b, c) {
            _ = a;
            async = b;
            DBS = c;
            return Project;
        }]);
    }
    
})();

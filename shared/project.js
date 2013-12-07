
(function() {

    var _ = null;
    var async = null;
    var DBS = null;

    function Project(options) {

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

        _.extend(slf, options);

        this.update = function(callback) {
            updateQueue.push({}, function() {
                if(!!callback) {
                    callback();
                }
            });
        };

        this.remove = function(callback) {
            DBS.Projects.remove(slf, function(err, response) {
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

    Project.addChangeListener = function(callback) {
        DBS.Projects.changes({
            continuous: true,
            onChange: function(change) {
                Project.get(change.id, function(err, project) {
                    if(!!callback) {
                        callback(err, project);
                    }
                });
            }
        });
    };

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

    Project.all = function(callback) {
        DBS.Projects.allDocs({
            include_docs: true
        }, function(err, docs) {
            if(!!err) {
                callback(err);
                return;
            }

            if(!!callback) {
                var projects = [];
                _.each(docs.rows, function(row) {
                    projects.push(Project.fromJson(row.doc));
                });
                callback(null, projects);
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
        angular.module('shared.entities').factory('ProjectEntity', ['_', 'async', 'DBS', function(a, b, c) {
            _ = a;
            async = b;
            DBS = c;
            return Project;
        }]);
    }

})();

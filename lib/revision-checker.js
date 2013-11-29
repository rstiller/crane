
var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var LOG = require('winston');

var DBS = require('./dbs');
var Repository = require('./repository').Repository;
var RevisionCheckTask = require('./revision-check-task').RevisionCheckTask;

function RevisionChecker() {
    
    var slf = this;
    
    this.emitter = new EventEmitter();
    
    this.check = function() {
        
        var allProjects = function(doc) {
            emit(doc, null);
        };
        
        var checkBranches = function(project, branches) {
            var branchesToUpdate = {};
            
            if(!!project.branches && !!branches) {
                _.each(project.branches, function(projectBranch, projectBranchName) {
                    _.each(branches, function(remoteBranchRev, remoteBranchName) {
                        if(projectBranchName == remoteBranchName && projectBranch.rev != remoteBranchRev) {
                            LOG.info('branch %s of project %s needs to be updated', projectBranchName, project.name);
                            branchesToUpdate[projectBranchName] = remoteBranchRev;
                        }
                    });
                });
            }
            
            return branchesToUpdate;
        };
        
        var checkTags = function(project, tags) {
            var tagsToUpdate = {};
            
            if(!!project.tags && !!tags) {
                _.each(project.tags, function(projectTag, projectTagName) {
                    _.each(tags, function(remoteTagRev, remoteTagName) {
                        if(projectTagName == remoteTagName && projectTag.rev != remoteTagRev) {
                            LOG.info('tag %s of project %s needs to be updated', projectTagName, project.name);
                            tagsToUpdate[projectTagName] = remoteTagRev;
                        }
                    });
                });
            } else if(!!tags) {
                _.each(tags, function(tagRev, tagName) {
                    tagsToUpdate[tagName] = tagRev;
                });
            }
            
            
            return tagsToUpdate;
        };
        
        var checkProject = function(project) {
            LOG.info('checking %s', project.name);
            
            Repository.remoteBranches(project.url, function(branches) {
                var branchesToUpdate = checkBranches(project, branches);
                Repository.remoteTags(project.url, function(tags) {
                    var tagsToUpdate = checkTags(project, tags);
                    slf.emitter.emit('build', project, branchesToUpdate, tagsToUpdate);
                });
            });
        };
        
        var processDocs = function(err, docs) {
            if(!!err) {
                LOG.error(err);
                return;$
            }
            
            _.each(docs.rows, function(doc) {
                checkProject(doc.key);
            });
        };
        
        DBS.Projects.query({ map: allProjects }, { reduce: false }, processDocs);
        
    };
    
    slf.emitter.on('build', function(project, branches, tags) {
        
        LOG.info('building dockerfiles in project %s for branches %s and tags %s', project.name, JSON.stringify(branches), JSON.stringify(tags));
        
        var funcs = [];
        
        project.branches = project.branches || {};
        project.tags = project.tags || {};
        
        _.each(branches, function(rev, name) {
            var checkProcess = new RevisionCheckTask(project, 'branch', name, rev);
            funcs.push(checkProcess.execute);
        });
        
        _.each(tags, function(rev, name) {
            var checkProcess = new RevisionCheckTask(project, 'tag', name, rev);
            funcs.push(checkProcess.execute);
        });
        
        async.parallel(funcs, function() {
            if(_.size(branches) > 0 || _.size(tags) > 0) {
                DBS.Projects.put(project, function(err, response) {
                    if(!!err) {
                        LOG.error(err);
                        return;
                    }
                    
                    LOG.info('dockerfiles saved for project %s', project.name);
                });
            }
        });
        
    });
    
}

module.exports.RevisionChecker = RevisionChecker;

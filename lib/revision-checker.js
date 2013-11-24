
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var async = require('async');

var Infrastructure = require('./infrastructure');
var Service = require('./service');
var DBS = require('./dbs');
var Repository = require('./repository').Repository;
var LOG = require('winston');

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
            _.each(docs.rows, function(doc) {
                checkProject(doc.key);
            });
        };
        
        DBS.Projects.query({ map: allProjects }, { reduce: false }, processDocs);
        
    };
    
    slf.emitter.on('build', function(project, branches, tags) {
        
        LOG.info('building dockerfiles in project %s for branches %s and tags %s', project.name, JSON.stringify(branches), JSON.stringify(tags));
        
        var buildInfrastructure = function(workingCopies, name, rev, next) {
            
            var repository = new Repository(project.name, name, project.url);
            var infrastructure = new Infrastructure(repository);
            
            async.waterfall([
                function(ready) {
                    repository.remove();
                    ready(null);
                },
                function(ready) {
                    repository.clone(null, function() {
                        LOG.info('project %s cloned - %s %s', project.name, name, rev);
                        ready(null);
                    });
                },
                function(ready) {
                    infrastructure.parseInfrastructure(function() {
                        LOG.info('infrastructure parsed for project %s - %s %s', project.name, name, rev);
                        ready(null);
                    });
                },
                function(ready) {
                    infrastructure.buildDockerfiles(function() {
                        
                        workingCopies[name] = workingCopies[name] || {};
                        workingCopies[name].infrastructure = infrastructure;
                        workingCopies[name].rev = rev;
                        
                        LOG.info('dockerfiles built for project %s - %s %s', project.name, name, rev);
                        
                        repository.remove();
                        
                        ready(null);
                        
                    });
                }
            ], function() {
                next(null);
            });
            
        };
        
        var funcs = [];
        
        project.branches = project.branches || {};
        project.tags = project.tags || {};
        
        _.each(branches, function(rev, name) {
            funcs.push(function(next) {
                buildInfrastructure(project.branches, name, rev, next);
            });
        });
        
        _.each(tags, function(rev, name) {
            funcs.push(function(next) {
                buildInfrastructure(project.tags, name, rev, next);
            });
        });
        
        async.parallel(funcs, function() {
            DBS.Projects.put(project, function(err, response) {
                if(!!err) {
                    LOG.error(err);
                    return;
                }
                
                LOG.info('dockerfiles saved for project %s', project.name);
            });
        });
        
    });
    
}

module.exports = RevisionChecker;

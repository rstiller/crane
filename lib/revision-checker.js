
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var async = require('async');

var Infrastructure = require('./infrastructure');
var Service = require('./service');
var DBS = require('./dbs');
var Container = require('./container');
var Repository = require('./repository').Repository;
var ImageBuildCommand = require('./image-builder').ImageBuildCommand;
var LOG = require('winston');

function CheckProcess(project, type, name, rev) {
    
    var slf = this;
    
    this.project = project;
    this.type = type;
    this.name = name;
    this.rev = rev;
    this.workingCopies = type === 'branch' ? project.branches : project.tags;
    this.repository = new Repository(project.name, name, project.url);
    this.infrastructure = new Infrastructure(this.repository);
    
    this.removeWorkingCopy = function(next) {
        slf.repository.remove();
        next(null);
    };
    
    this.cloneWorkingCopy = function(next) {
        slf.repository.clone(null, function() {
            LOG.info('project %s cloned - %s %s', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
    this.parseInfrastructure = function(next) {
        slf.infrastructure.parseInfrastructure(function() {
            LOG.info('infrastructure parsed for project %s - %s %s', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
    this.buildDockerfiles = function(next) {
        slf.infrastructure.buildDockerfiles(function() {
            
            slf.workingCopies[name] = slf.workingCopies[slf.name] || {};
            slf.workingCopies[name].infrastructure = slf.infrastructure;
            slf.workingCopies[name].rev = slf.rev;
            
            LOG.info('dockerfiles built for project %s - %s %s', slf.project.name, slf.name, slf.rev);
            
            next(null);
            
        });
    };
    
    this.listFiles = function(next) {
        slf.repository.listFiles(function(files) {
            next(null, files);
        });
    };
    
    this.saveFiles = function(files, next) {
        slf.infrastructure.files = slf.infrastructure.files || {};
        var fileContents = [];
        
        _.each(files, function(hash, filename) {
            fileContents.push(function(nextFile) {
                slf.repository.readFile(hash, function(content) {
                    if(!!filename && filename != '') {
                        slf.infrastructure.files[filename] = new Buffer(content).toString('base64');
                    }
                    nextFile(null);
                });
            });
        });
        
        async.parallel(fileContents, function() {
            next(null);
        });
    };
    
    this.saveBuildCommands = function(next) {
        var docs = [];
        
        _.each(slf.infrastructure.environments, function(variables, environment) {
            _.each(slf.infrastructure.services, function(config, service) {
                var build = new ImageBuildCommand(slf.project._id, slf.name, slf.type, service, environment);
                docs.push(build.toJson());
            });
        });
        
        DBS.Builds.bulkDocs({
            'docs': docs
        }, function(err) {
            if(!!err) {
                LOG.error(err);
                return;
            }
            
            LOG.info('build commands submitted for project %s - %s %s', slf.project.name, slf.name, slf.rev);
            
            next(null);
        });
    };
    
    this.getExecutionChain = function() {
        return [
            slf.removeWorkingCopy,
            slf.cloneWorkingCopy,
            slf.parseInfrastructure,
            slf.buildDockerfiles,
            slf.listFiles,
            slf.saveFiles,
            slf.removeWorkingCopy,
            slf.saveBuildCommands
        ];
    };
    
    this.execute = function(next) {
        async.waterfall(slf.getExecutionChain(), function() {
            next(null);
        });
    };
    
}

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
            var checkProcess = new CheckProcess(project, 'branch', name, rev);
            funcs.push(checkProcess.execute);
        });
        
        _.each(tags, function(rev, name) {
            var checkProcess = new CheckProcess(project, 'tag', name, rev);
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


var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var url = require("url");
var Infrastructure = require('../shared/infrastructure');
var DBS = require('./dbs');
var Repository = require('./repository').Repository;

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
                    _.each(branches, function(remoteBranchName, remoteBranchRev) {
                        if(projectBranchName == remoteBranchName && projectBranch.rev != remoteBranchRev) {
                            console.log('branch', projectBranchName, 'of project', project.name, 'needs to be updated');
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
                    _.each(tags, function(remoteTagName, remoteTagRev) {
                        if(projectTagName == remoteTagName && projectTag.rev != remoteTagRev) {
                            console.log('tag', projectTagName, 'of project', project.name, 'needs to be updated');
                            tagsToUpdate[projectTagName] = remoteTagRev;
                        }
                    });
                });
            } else if(!!tags) {
                _.each(tags, function(tagName, tagRev) {
                    tagsToUpdate[tagName] = tagRev;
                });
            }
            
            
            return tagsToUpdate;
        };
        
        var checkProject = function(project) {
            console.log('checking', project.name);
            
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
        
        console.log('building dockerfiles in project', project.name, 'for branches', branches, 'and tags', tags);
        
        var counter = (_.size(branches) === 0 ? 1 : _.size(branches)) * (_.size(tags) === 0 ? 1 : _.size(tags));
        var buildInfrastructure = function(type, name, rev) {
            
            var infrastructure = new Infrastructure();
            
            infrastructure.fetch({
                'project': project,
                'type': type,
                'name': name,
                'rev': rev,
                'callback': function() {
                    
                    console.log('infrastructure file fetched in project', project.name, 'in', type, name);
                    
                    infrastructure.buildDockerfiles(function() {
                        
                        var workingCopies = {};
                        if(type === 'branch') {
                            project.branches = project.branches || {};
                            workingCopies = project.branches;
                        } else {
                            project.tags = project.tags || {};
                            workingCopies = project.tags;
                        }
                        workingCopies[name] = workingCopies[name] || {};
                        workingCopies[name].infrastructure = infrastructure;
                        workingCopies[name].rev = rev;
                        
                        counter--;
                        if(counter === 0) {
                            dbs.projects.put(project, function(err, response) {
                                if(!!err) {
                                    console.log(err);
                                    return;
                                }
                                
                                console.log('dockerfiles saved for project', project.name);
                            });
                        }
                        
                    });
                    
                }
            });
            
        };
        
        _.each(branches, function(rev, name) {
            buildInfrastructure('branch', name, rev);
        });
        
        _.each(tags, function(rev, name) {
            buildInfrastructure('tag', name, rev);
        });
        
    });
    
}

module.exports = RevisionChecker;

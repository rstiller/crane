
var _ = require('underscore');
var url = require("url");
var reader = require('../shared/reader');
var githubUrl = require('../shared/github-url');
var Streamer = require('./command-streamer');

function RevisionChecker() {
    
    this.check = function(databases, emitter) {
        
        var allProjects = function(doc) {
            emit(doc, null);
        };
        
        var checkBranches = function(project, branches) {
            var branchesToUpdate = {};
            
            if(!!project.branches && !!branches) {
                _.each(project.branches, function(projectBranch, projectBranchName) {
                    _.each(branches, function(remoteBranch) {
                        if(projectBranchName === remoteBranch.name && projectBranch.rev != remoteBranch.commit.sha) {
                            branchesToUpdate[projectBranchName] = remoteBranch.commit.sha;
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
                    _.each(tags, function(remoteTag) {
                        if(projectTagName === remoteTag.name && projectTag.rev != remoteTag.commit.sha) {
                            tagsToUpdate[projectTagName] = remoteTag.commit.sha;
                        }
                    });
                });
            } else if(!!tags) {
                _.each(tags, function(tag) {
                    tagsToUpdate[tag.name] = tag.commit.sha;
                });
            }
            
            
            return tagsToUpdate;
        };
        
        var checkProject = function(project) {
            var branchesAddress = url.parse(githubUrl.getBranchesUrl(project));
            var tagsAddress = url.parse(githubUrl.getTagsUrl(project));
            
            reader(branchesAddress, function(err, branches) {
                var branchesToUpdate = checkBranches(project, JSON.parse(branches));
                reader(tagsAddress, function(err, tags) {
                    var tagsToUpdate = checkTags(project, JSON.parse(tags));
                    emitter.emit('build', project, branchesToUpdate, tagsToUpdate);
                });
            });
        };
        
        var processDocs = function(err, docs) {
            _.each(docs.rows, function(doc) {
                checkProject(doc.key);
            });
        };
        
        databases.projects.query({ map: allProjects }, { reduce: false }, processDocs);
        
    };
    
}

module.exports = RevisionChecker;

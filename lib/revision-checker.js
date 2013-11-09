
var _ = require('underscore');
var url = require("url");
var reader = require('../shared/reader');
var githubUrl = require('../shared/github-url');
var Streamer = require('./command-streamer');

function checkProjects(databases, emitter) {
    
    var allProjects = function(doc) {
        emit(doc, null);
    };
    
    var checkBranches = function(project, branches) {
        var branchesToUpdate = {};
        
        if(!!project.branches && !!branches) {
            _.each(project.branches, function(projectBranch) {
                _.each(branches, function(remoteBranch) {
                    if(projectBranch.name === remoteBranch.name && projectBranch.rev != remoteBranch.commit.sha) {
                        branchesToUpdate[projectBranch.name] = remoteBranch.commit.sha;
                    }
                });
            });
        }
        
        return branchesToUpdate;
    };
    
    var checkTags = function(project, tags) {
        var tagsToUpdate = {};
        
        if(!!project.tags && !!tags) {
            _.each(project.tags, function(projectTag) {
                _.each(tags, function(remoteTag) {
                    if(projectTag.name === remoteTag.name && projectTag.rev != remoteTag.commit.sha) {
                        tagsToUpdate[projectTag.name] = remoteTag.commit.sha;
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
            _.each(branchesToUpdate, function(value, key) {
                emitter.emit('build', project, 'branch', key, value);
            });
        });
        
        reader(tagsAddress, function(err, tags) {
            var tagsToUpdate = checkTags(project, JSON.parse(tags));
            _.each(tagsToUpdate, function(value, key) {
                emitter.emit('build', project, 'tag', key, value);
            });
        });
    };
    
    var processDocs = function(err, docs) {
        _.each(docs.rows, function(doc) {
            checkProject(doc.key);
        });
    };
    
    databases.projects.query({ map: allProjects }, { reduce: false }, processDocs);
    
}

module.exports = checkProjects;

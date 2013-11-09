
var _ = require('underscore');
var url = require("url");
var Request = require('./request');
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
        var repo = project.url.split('github.com/')[1];
        var branchesAddress = url.parse('https://api.github.com/repos/' + repo + '/branches');
        var tagsAddress = url.parse('https://api.github.com/repos/' + repo + '/tags');
        
        Request(branchesAddress, function(branches) {
            var branchesToUpdate = checkBranches(project, JSON.parse(branches));
            _.each(branchesToUpdate, function(value, key) {
                emitter.emit('build', project._id, 'branch', key, value);
            });
        });
        
        Request(tagsAddress, function(tags) {
            var tagsToUpdate = checkTags(project, JSON.parse(tags));
            _.each(tagsToUpdate, function(value, key) {
                emitter.emit('build', project._id, 'tag', key, value);
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


var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var LOG = require('winston');

var Project = require('../shared/project').Project;
var Repository = require('./models/repository').Repository;
var RevisionCheckTask = require('./revision-check-task').RevisionCheckTask;

module.exports.RevisionChecker = Backbone.Model.extend({
    checkAllProjects: function() {
        var slf = this;

        Project.all({
            success: function(projects) {
                _.each(projects, function(project) {
                    slf.checkProject(project);
                });
            }
        });
    },
    checkBranches: function(project, branches) {
        var branchesToUpdate = {};

        if(!!project.get('branches') && !!branches) {
            _.each(project.get('branches'), function(projectBranch, projectBranchName) {
                _.each(branches, function(remoteBranchRev, remoteBranchName) {
                    if(projectBranchName == remoteBranchName && projectBranch.rev != remoteBranchRev) {
                        LOG.info(__filename + ' - branch %s of project %s needs to be updated', projectBranchName, project.get('name'));
                        branchesToUpdate[projectBranchName] = remoteBranchRev;
                    }
                });
            });
        }

        return branchesToUpdate;
    },
    checkTags: function(project, tags) {
        var tagsToUpdate = {};

        if(!!project.get('tags') && !!tags) {
            _.each(project.get('tags'), function(projectTag, projectTagName) {
                _.each(tags, function(remoteTagRev, remoteTagName) {
                    if(projectTagName == remoteTagName && projectTag.rev != remoteTagRev) {
                        LOG.info(__filename + ' - tag %s of project %s needs to be updated', projectTagName, project.get('name'));
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
    },
    checkProject: function(project) {
        LOG.info(__filename + ' - checking %s', project.get('name'));

        var funcs = [];
        var slf = this;

        funcs.push(function(next) {
            Repository.remoteBranches(project.get('url'), function(branches) {
                next(null, slf.checkBranches(project, branches));
            });
        });

        funcs.push(function(next) {
            Repository.remoteTags(project.get('url'), function(tags) {
                next(null, slf.checkTags(project, tags));
            });
        });

        async.parallel(funcs, function(err, results) {
            var revisionCheckTasks = [];
            var branches = results[0];
            var tags = results[1];

            project.set({
                'branches': project.get('branches') || {},
                'tags': project.get('tags') || {}
            });

            _.each(branches, function(rev, name) {
                var checkProcess = new RevisionCheckTask({
                    'project': project,
                    'type': 'branch',
                    'name': name,
                    'rev': rev
                });
                revisionCheckTasks.push(function(next) {
                    checkProcess.execute(next);
                });
            });

            _.each(tags, function(rev, name) {
                var checkProcess = new RevisionCheckTask({
                    'project': project,
                    'type': 'tag',
                    'name': name,
                    'rev': rev
                });
                revisionCheckTasks.push(function(next) {
                    checkProcess.execute(next);
                });
            });

            async.parallel(revisionCheckTasks, function() {
                if(_.size(branches) > 0 || _.size(tags) > 0) {
                    LOG.info(__filename + ' - saving project %s', project.get('name'));
                    project.save({
                        success: function() {
                            LOG.info(__filename + ' - project %s saved', project.get('name'));
                        }
                    });
                }
            });
        });
    }
}, {
});

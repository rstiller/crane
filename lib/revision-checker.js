
var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var LOG = require('winston');

var Project = require('../shared/project').Project;
var Repository = require('./models/repository').Repository;
var RevisionCheckTask = require('./revision-check-task').RevisionCheckTask;

function RevisionChecker() {

    var slf = this;

    this.emitter = new EventEmitter();

    this.check = function() {

        var checkBranches = function(project, branches) {
            var branchesToUpdate = {};

            if(!!project.get('branches') && !!branches) {
                _.each(project.get('branches'), function(projectBranch, projectBranchName) {
                    _.each(branches, function(remoteBranchRev, remoteBranchName) {
                        if(projectBranchName == remoteBranchName && projectBranch.rev != remoteBranchRev) {
                            LOG.info('branch %s of project %s needs to be updated', projectBranchName, project.get('name'));
                            branchesToUpdate[projectBranchName] = remoteBranchRev;
                        }
                    });
                });
            }

            return branchesToUpdate;
        };

        var checkTags = function(project, tags) {
            var tagsToUpdate = {};

            if(!!project.get('tags') && !!tags) {
                _.each(project.get('tags'), function(projectTag, projectTagName) {
                    _.each(tags, function(remoteTagRev, remoteTagName) {
                        if(projectTagName == remoteTagName && projectTag.rev != remoteTagRev) {
                            LOG.info('tag %s of project %s needs to be updated', projectTagName, project.get('name'));
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
            LOG.info('checking %s', project.get('name'));

            Repository.remoteBranches(project.get('url'), function(branches) {
                var branchesToUpdate = checkBranches(project, branches);
                Repository.remoteTags(project.get('url'), function(tags) {
                    var tagsToUpdate = checkTags(project, tags);
                    slf.emitter.emit('build', project, branchesToUpdate, tagsToUpdate);
                });
            });
        };

        Project.all(function(err, projects) {
            _.each(projects, function(project) {
                checkProject(project);
            });
        });
    };

    slf.emitter.on('build', function(project, branches, tags) {

        LOG.info('building dockerfiles in project %s for branches %s and tags %s', project.get('name'), JSON.stringify(branches), JSON.stringify(tags));

        var funcs = [];

        project.set('branches', project.get('branches') || {});
        project.set('tags', project.get('tags') || {});

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
                LOG.info('saving project %s', project.get('name'));
                project.save({
                    success: function() {
                        LOG.info('project %s saved', project.get('name'));
                    }
                });
            }
        });

    });

}

module.exports.RevisionChecker = RevisionChecker;

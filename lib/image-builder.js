
var _ = require('underscore');
var LOG = require('winston');

var Container = require('./models/container').Container;
var Build = require('../shared/build').Build;
var Project = require('../shared/project').Project;

function ImageBuilder() {

    var slf = this;

    this.buildImage = function(build) {
        var project = new Project({
            '_id': build.projectId
        });

        project.fetch({
            success: function(err, project) {
                var workingCopies = build.get('workingCopyType') === 'branch' ? project.get('branches') : project.get('tags');
                if(!!workingCopies) {

                    var workingCopy = workingCopies[build.get('workingCopyName')];
                    if(!!workingCopy) {
                        var infrastructure = workingCopy.infrastructure;
                        var container = new Container(project, build, infrastructure);

                        LOG.info('starting build for project %s (name: %s, rev: %s, service: %s, environment: %s)',
                            project.get('name'),
                            build.get('workingCopyName'),
                            workingCopy.rev,
                            build.get('service'),
                            build.get('environment'));

                        container.build(function() {
                            build.finish();
                            build.save({
                                success: function() {
                                    LOG.info('build command updated for project %s (name: %s, rev: %s, service: %s, environment: %s)',
                                        project.get('name'),
                                        build.get('workingCopyName'),
                                        workingCopy.rev,
                                        build.get('service'),
                                        build.get('environment'));
                                }
                            });
                        });
                    }
                }
            }
        });
    };

    this.triggerImageBuild = function(build) {
        if(!!build && build.get('status') === Build.Status.CREATED) {
            LOG.info('new build-command for projectId %s (name: %s, service: %s, environment: %s) detected',
                build.get('projectId'),
                build.get('workingCopyName'),
                build.get('service'),
                build.get('environment'));

            build.start();
            build.save({
                success: function() {
                    LOG.info('build-command for projectId %s (name: %s, service: %s, environment: %s) updated',
                        build.get('projectId'),
                        build.get('workingCopyName'),
                        build.get('service'),
                        build.get('environment'));

                    slf.buildImage(build);
                }
            });
        }
    };

    this.listen = function() {
        Build.addChangeListener({
            success: function(build) {
                slf.triggerImageBuild(build);
            }
        });
    };

};

module.exports.ImageBuilder = ImageBuilder;


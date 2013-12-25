
var _ = require('underscore');
var Backbone = require('backbone');
var LOG = require('winston');

var Container = require('./models/container').Container;
var BuildCommand = require('../shared/build-command').BuildCommand;
var Project = require('../shared/project').Project;

module.exports.ImageBuilder = Backbone.Model.extend({
    buildImage: function(build) {
        var project = new Project({
            '_id': build.get('projectId')
        });

        project.fetch({
            success: function(project) {
                var workingCopies = build.get('workingCopyType') === 'branch' ? project.get('branches') : project.get('tags');

                if(!!workingCopies) {

                    var workingCopy = workingCopies[build.get('workingCopyName')];
                    if(!!workingCopy) {
                        var infrastructure = workingCopy.infrastructure;
                        var container = new Container({
                            'project': project,
                            'build': build,
                            'infrastructure': infrastructure
                        });

                        LOG.info(__filename + ' - starting build for project %s (name: %s, rev: %s, service: %s, environment: %s)',
                            project.get('name'), build.get('workingCopyName'),
                            workingCopy.rev, build.get('service'), build.get('environment'));

                        container.build(function() {
                            build.finish();
                            build.save({
                                success: function() {
                                    LOG.info(__filename + ' - build command updated for project %s (name: %s, rev: %s, service: %s, environment: %s)',
                                        project.get('name'), build.get('workingCopyName'),
                                        workingCopy.rev, build.get('service'), build.get('environment'));
                                }
                            });
                        });
                    }
                }
            }
        });
    },
    triggerImageBuildCommand: function(build) {
        var slf = this;

        LOG.info(__filename + ' - new build-command for projectId %s (name: %s, service: %s, environment: %s) detected',
            build.get('projectId'), build.get('workingCopyName'),
            build.get('service'), build.get('environment'));

        build.start();
        build.save({
            success: function() {
                LOG.info(__filename + ' - build-command for projectId %s (name: %s, service: %s, environment: %s) updated',
                    build.get('projectId'), build.get('workingCopyName'),
                    build.get('service'), build.get('environment'));

                slf.buildImage(build);
            }
        });
    },
    listen: function() {
        var slf = this;

        BuildCommand.addChangeListener({
            success: function(build) {
                if(!!build && build.get('status') === BuildCommand.STATUS.CREATED) {
                    slf.triggerImageBuildCommand(build);
                }
            }
        });
    }
}, {
});

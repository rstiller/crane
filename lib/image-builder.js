
var _ = require('underscore');
var LOG = require('winston');

var Container = require('./models/container').Container;
var Build = require('./entities/build').Build;
var Project = require('./entities/project').Project;

function ImageBuilder() {
    
    var slf = this;
    
    this.buildImage = function(build) {
        Project.get(build.projectId, function(project) {
            var workingCopies = build.workingCopyType === 'branch' ? project.branches : project.tags;
            if(!!workingCopies) {
               
                var workingCopy = workingCopies[build.workingCopyName];
                if(!!workingCopy) {
                    var infrastructure = workingCopy.infrastructure;
                    var container = new Container(project, build, infrastructure);
                    
                    LOG.info('starting build for project %s (name: %s, rev: %s, service: %s, environment: %s)',
                        project.name,
                        build.workingCopyName,
                        workingCopy.rev,
                        build.service,
                        build.environment);
                    
                    container.build(function() {
                        build.finish();
                        build.update(function() {
                            LOG.info('build command updated for project %s (name: %s, rev: %s, service: %s, environment: %s)',
                                project.name,
                                build.workingCopyName,
                                workingCopy.rev,
                                build.service,
                                build.environment);
                        });
                    });
                }
            }
        });
    };
    
    this.triggerImageBuild = function(build) {
        if(!!build && build.status === Build.Status.CREATED) {
            LOG.info('new build-command for projectId %s (name: %s, service: %s, environment: %s) detected',
                build.projectId,
                build.workingCopyName,
                build.service,
                build.environment);
            
            build.start();
            build.update(function() {
                LOG.info('build-command for projectId %s (name: %s, service: %s, environment: %s) updated',
                    build.projectId,
                    build.workingCopyName,
                    build.service,
                    build.environment);
                
                slf.buildImage(build);
            });
        }
    };
    
    this.listen = function() {
        Build.addChangeListener(function(build) {
            slf.triggerImageBuild(build);
        });
    };
    
};

module.exports.ImageBuilder = ImageBuilder;

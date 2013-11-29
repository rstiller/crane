
var _ = require('underscore');
var LOG = require('winston');

var Container = require('./container').Container;
var DBS = require('./dbs');
var ImageBuilderCommand = require('./image-builder-command').ImageBuilderCommand;

function ImageBuilder() {
    
    var slf = this;
    
    this.buildImage = function(imageBuilderCommand) {
        DBS.Projects.get(imageBuilderCommand.projectId, function(err, project) {
            if(!!err) {
                LOG.error(err);
                return;
            }
            
            var workingCopies = imageBuilderCommand.workingCopyType === 'branch' ? project.branches : project.tags;
            if(!!workingCopies) {
               
                var workingCopy = workingCopies[imageBuilderCommand.workingCopyName];
                if(!!workingCopy) {
                    var infrastructure = workingCopy.infrastructure;
                    var container = new Container(project, imageBuilderCommand.workingCopyName, imageBuilderCommand.service, imageBuilderCommand.environment, infrastructure);
                    
                    container.build(function() {
                        imageBuilderCommand.finish();
                        DBS.Builds.put(imageBuilderCommand, function(err, data) {
                            if(!!err) {
                                LOG.error(err);
                                return;
                            }
                            
                            imageBuilderCommand._rev = data.rev;
                        });
                    });
                }
            }
        });
    };
    
    this.triggerImageBuild = function(id) {
        DBS.Builds.get(id, function(err, buildData) {
            if(!!err) {
                LOG.error(err);
                return;
            }
            
            var imageBuilderCommand = ImageBuilderCommand.fromJson(buildData);
            
            if(!!imageBuilderCommand && imageBuilderCommand.status === ImageBuilderCommand.Status.CREATED) {
                imageBuilderCommand.start();
                DBS.Builds.put(imageBuilderCommand, function(err, data) {
                    if(!!err) {
                        LOG.error(err);
                        return;
                    }
                    
                    imageBuilderCommand._rev = data.rev;
                    slf.buildImage(imageBuilderCommand);
                });
            }
        });
    };
    
    this.listen = function() {
        DBS.Builds.changes({
            continuous: true,
            onChange: function(change) {
                slf.triggerImageBuild(change.id);
            }
        });
    };
    
};

module.exports.ImageBuilder = ImageBuilder;

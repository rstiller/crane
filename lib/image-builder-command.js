
var _ = require('underscore');

function ImageBuilderCommand(projectId, workingCopyName, workingCopyType, service, environment) {
    
    var slf = this;
    
    this.projectId = projectId;
    this.workingCopyName = workingCopyName;
    this.workingCopyType = workingCopyType;
    this.service = service;
    this.environment = environment;
    this.status = ImageBuilderCommand.Status.CREATED;
    this.created = new Date();
    this.started = null;
    this.finished = null;
    this.successful = false;
    this.out = '';
    this.err = '';
    this.cmd = '';
    
    this.start = function() {
        slf.status = ImageBuilderCommand.Status.STARTED;
        slf.started = new Date();
    };
    
    this.finish = function() {
        slf.status = ImageBuilderCommand.Status.FINISHED;
        slf.finished = new Date();
    };
    
    this.toJson = function() {
        return {
            'projectId': slf.projectId,
            'workingCopyName': slf.workingCopyName,
            'workingCopyType': slf.workingCopyType,
            'service': slf.service,
            'environment': slf.environment,
            'status': slf.status,
            'created': slf.created,
            'started': slf.started,
            'finished': slf.finished,
            'successful': slf.successful,
            'out': slf.out,
            'err': slf.err,
            'cmd': slf.cmd
        };
    };
    
}

ImageBuilderCommand.fromJson = function(json) {
    var imageBuilderCommand = new ImageBuilderCommand(
        json.projectId,
        json.workingCopyName,
        json.workingCopyType,
        json.service,
        json.environment
    );
    _.extend(imageBuilderCommand, json);
    return imageBuilderCommand;
};

ImageBuilderCommand.Status = {};
ImageBuilderCommand.Status.CREATED = 'created';
ImageBuilderCommand.Status.STARTED = 'started';
ImageBuilderCommand.Status.FINISHED = 'finished';

module.exports.ImageBuilderCommand = ImageBuilderCommand;

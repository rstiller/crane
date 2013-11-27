
var Container = require('./container').Container;
var DBS = require('./dbs');
var Repository = require('./repository').Repository;

function ImageBuilder() {
    
    var slf = this;
    
    this.buildImage = function(projectId, workingCopyName, workingCopyType, service, environment, callback) {
        DBS.Project.get(projectId, function(project) {
            
            var repository = new Repository(project.name, workingCopyName, project.url);
            var workingCopies = workingCopyType === 'branch' ? project.branches : project.tags;
            var workingCopy = workingCopies[workingCopyName];
            var infrastructure = workingCopy.infrastructure;
            var container = new Container(project, workingCopyName, service, environment, infrastructure, repository);
            
            container.build(function() {
                // TODO
            });
            
        });
    };
    
    this.listen = function() {
        
        DBS.Builds.changes({
            continuous: true,
            complete: function(changes) {
                console.log('complete - changes', changes);
            },
            onChange: function(changes) {
                console.log('onChange - changes', changes);
            }
        });
        
    };
    
};

function ImageBuildCommand(projectId, workingCopyName, workingCopyType, service, environment) {
    
    var slf = this;
    
    this.projectId = projectId;
    this.workingCopyName = workingCopyName;
    this.workingCopyType = workingCopyType;
    this.service = service;
    this.environment = environment;
    
    this.toJson = function() {
        return {
            'projectId': slf.projectId,
            'workingCopyName': slf.workingCopyName,
            'workingCopyType': slf.workingCopyType,
            'service': slf.service,
            'environment': slf.environment
        };
    };
    
}

module.exports.ImageBuildCommand = ImageBuildCommand;
module.exports.ImageBuilder = ImageBuilder;

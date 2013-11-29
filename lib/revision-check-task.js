
var _ = require('underscore');
var async = require('async');
var LOG = require('winston');

var DBS = require('./dbs');
var ImageBuilderCommand = require('./image-builder-command').ImageBuilderCommand;
var Infrastructure = require('./infrastructure').Infrastructure;
var Repository = require('./repository').Repository;

function RevisionCheckTask(project, type, name, rev) {
    
    var slf = this;
    
    this.project = project;
    this.type = type;
    this.name = name;
    this.rev = rev;
    this.workingCopies = type === 'branch' ? project.branches : project.tags;
    this.repository = new Repository(project.name, name, project.url);
    this.infrastructure = new Infrastructure(this.repository);
    
    this.removeWorkingCopy = function(next) {
        slf.repository.remove();
        next(null);
    };
    
    this.cloneWorkingCopy = function(next) {
        slf.repository.clone(null, function() {
            LOG.info('project %s cloned - %s %s', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
    this.parseInfrastructure = function(next) {
        slf.infrastructure.parseInfrastructure(function() {
            LOG.info('infrastructure parsed for project %s - %s %s', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
    this.buildDockerfiles = function(next) {
        slf.infrastructure.buildDockerfiles(function() {
            
            slf.workingCopies[name] = slf.workingCopies[slf.name] || {};
            slf.workingCopies[name].infrastructure = slf.infrastructure;
            slf.workingCopies[name].rev = slf.rev;
            
            LOG.info('dockerfiles built for project %s - %s %s', slf.project.name, slf.name, slf.rev);
            
            next(null);
            
        });
    };
    
    this.listFiles = function(next) {
        slf.repository.listFiles(function(files) {
            next(null, files);
        });
    };
    
    this.saveFiles = function(files, next) {
        slf.infrastructure.files = slf.infrastructure.files || {};
        var fileContents = [];
        
        _.each(files, function(hash, filename) {
            fileContents.push(function(nextFile) {
                slf.repository.readFile(hash, function(content) {
                    if(!!filename && filename != '') {
                        slf.infrastructure.files[filename] = new Buffer(content).toString('base64');
                    }
                    nextFile(null);
                });
            });
        });
        
        async.parallel(fileContents, function() {
            next(null);
        });
    };
    
    this.saveBuildCommands = function(next) {
        var docs = [];
        
        _.each(slf.infrastructure.environments, function(variables, environment) {
            _.each(slf.infrastructure.services, function(config, service) {
                var build = new ImageBuilderCommand(slf.project._id, slf.name, slf.type, service, environment);
                docs.push(build.toJson());
            });
        });
        
        DBS.Builds.bulkDocs({
            'docs': docs
        }, function(err) {
            if(!!err) {
                LOG.error(err);
                return;
            }
            
            LOG.info('build commands submitted for project %s - %s %s', slf.project.name, slf.name, slf.rev);
            
            next(null);
        });
    };
    
    this.getExecutionChain = function() {
        return [
            slf.removeWorkingCopy,
            slf.cloneWorkingCopy,
            slf.parseInfrastructure,
            slf.buildDockerfiles,
            slf.listFiles,
            slf.saveFiles,
            slf.removeWorkingCopy,
            slf.saveBuildCommands
        ];
    };
    
    this.execute = function(next) {
        async.waterfall(slf.getExecutionChain(), function() {
            next(null);
        });
    };
    
}

module.exports.RevisionCheckTask = RevisionCheckTask;

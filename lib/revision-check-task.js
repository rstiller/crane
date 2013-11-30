
var _ = require('underscore');
var async = require('async');
var LOG = require('winston');

var Build = require('./entities/build').Build;
var Infrastructure = require('./models/infrastructure').Infrastructure;
var Repository = require('./models/repository').Repository;

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
        LOG.info('temporary folder for project %s (name: %s, rev: %s) removed', slf.project.name, slf.name, slf.rev);
        next(null);
    };
    
    this.cloneWorkingCopy = function(next) {
        LOG.info('cloning project %s (name: %s, rev: %s)', slf.project.name, slf.name, slf.rev);
        slf.repository.clone(function() {
            LOG.info('project %s (name: %s, rev: %s) cloned', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
    this.parseInfrastructure = function(next) {
        slf.infrastructure.parseInfrastructure(function() {
            LOG.info('infrastructure parsed for project %s (name: %s, rev: %s)', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
    this.buildDockerfiles = function(next) {
        slf.infrastructure.buildDockerfiles(function() {
            
            slf.workingCopies[name] = slf.workingCopies[slf.name] || {};
            slf.workingCopies[name].infrastructure = slf.infrastructure;
            slf.workingCopies[name].rev = slf.rev;
            
            LOG.info('dockerfiles built for project %s (name: %s, rev: %s)', slf.project.name, slf.name, slf.rev);
            
            next(null);
            
        });
    };
    
    this.saveBuildCommands = function(next) {
        var docs = [];
        
        _.each(slf.infrastructure.environments, function(variables, environment) {
            _.each(slf.infrastructure.services, function(config, service) {
                var build = new Build(slf.project._id, slf.name, slf.type, service, environment);
                docs.push(build.toJson());
            });
        });
        
        Build.saveAll(docs, function() {
            LOG.info('build commands submitted for project %s (name: %s, rev: %s)', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
    this.getExecutionChain = function() {
        return [
            slf.removeWorkingCopy,
            slf.cloneWorkingCopy,
            slf.parseInfrastructure,
            slf.buildDockerfiles,
            slf.removeWorkingCopy,
            slf.saveBuildCommands
        ];
    };
    
    this.execute = function(next) {
        LOG.info('staring build for project %s (name: %s, rev: %s)', slf.project.name, slf.name, slf.rev);
        async.waterfall(slf.getExecutionChain(), function() {
            LOG.info('build for project %s (name: %s, rev: %s) triggered', slf.project.name, slf.name, slf.rev);
            next(null);
        });
    };
    
}

module.exports.RevisionCheckTask = RevisionCheckTask;

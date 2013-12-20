
var _ = require('underscore');
var async = require('async');
var LOG = require('winston');

var BuildCommand = require('../shared/build-command').BuildCommand;
var Infrastructure = require('./models/infrastructure').Infrastructure;
var Repository = require('./models/repository').Repository;

function RevisionCheckTask(project, type, name, rev) {

    var slf = this;

    this.project = project;
    this.type = type;
    this.name = name;
    this.rev = rev;
    this.workingCopies = type === 'branch' ? project.get('branches') : project.get('tags');
    this.repository = new Repository(project.get('name'), name, project.get('url'));
    this.infrastructure = new Infrastructure(this.repository);

    this.removeWorkingCopy = function(next) {
        slf.repository.remove();
        LOG.info('temporary folder for project %s (name: %s, rev: %s) removed', slf.project.get('name'), slf.name, slf.rev);
        next(null);
    };

    this.cloneWorkingCopy = function(next) {
        LOG.info('cloning project %s (name: %s, rev: %s)', slf.project.get('name'), slf.name, slf.rev);
        slf.repository.clone(function() {
            LOG.info('project %s (name: %s, rev: %s) cloned', slf.project.get('name'), slf.name, slf.rev);
            next(null);
        });
    };

    this.parseInfrastructure = function(next) {
        LOG.info('parsing infrastructure for project %s (name: %s, rev: %s)', slf.project.get('name'), slf.name, slf.rev);
        slf.infrastructure.parseInfrastructure(function() {
            LOG.info('infrastructure parsed for project %s (name: %s, rev: %s)', slf.project.get('name'), slf.name, slf.rev);
            next(null);
        });
    };

    this.buildDockerfiles = function(next) {
        LOG.info('building dockerfiles for project %s (name: %s, rev: %s)', slf.project.get('name'), slf.name, slf.rev);
        slf.infrastructure.buildDockerfiles(function() {

            slf.workingCopies[name] = slf.workingCopies[slf.name] || {};
            slf.workingCopies[name].infrastructure = slf.infrastructure;
            slf.workingCopies[name].rev = slf.rev;

            LOG.info('dockerfiles built for project %s (name: %s, rev: %s)', slf.project.get('name'), slf.name, slf.rev);

            next(null);

        });
    };

    this.saveBuildCommands = function(next) {
        var docs = [];

        _.each(slf.infrastructure.environments, function(variables, environment) {
            _.each(slf.infrastructure.services, function(config, service) {
                var build = new BuildCommand(slf.project.get('_id'), slf.name, slf.type, slf.rev, service, environment);
                docs.push(build.toJSON());
            });
        });

        Build.saveAll(docs, function(err) {
            LOG.info('build commands submitted for project %s (name: %s, rev: %s)', slf.project.get('name'), slf.name, slf.rev);
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
        LOG.info('staring build for project %s (name: %s, rev: %s)', slf.project.get('name'), slf.name, slf.rev);
        async.waterfall(slf.getExecutionChain(), function() {
            LOG.info('build for project %s (name: %s, rev: %s) triggered', slf.project.get('name'), slf.name, slf.rev);
            next(null);
        });
    };

}

module.exports.RevisionCheckTask = RevisionCheckTask;

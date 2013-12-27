
var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var LOG = require('winston');

var BuildJob = require('../shared/build-job').BuildJob;
var Infrastructure = require('./models/infrastructure').Infrastructure;
var Repository = require('./models/repository').Repository;

module.exports.RevisionCheckTask = Backbone.Model.extend({
    defaults: {
        project: '',
        type: '',
        name: '',
        rev: '',
        workingCopies: null,
        repository: null,
        infrastructure: null
    },
    initialize: function(attributes) {
        if(attributes.type === 'branch') {
            this.set('workingCopies', attributes.project.get('branches'));
        } else {
            this.set('workingCopies', attributes.project.get('tags'));
        }
        this.set('repository', new Repository({
            'repository': attributes.project.get('name'),
            'workingCopy': attributes.name,
            'url': attributes.project.get('url')
        }));
        this.set('infrastructure', new Infrastructure({
            'repository': this.get('repository')
        }));
    },
    removeWorkingCopy: function(next) {
        this.get('repository').remove();
        LOG.info(__filename + ' - temporary folder for project %s (name: %s, rev: %s) removed', this.get('project').get('name'), this.get('name'), this.get('rev'));
        next(null);
    },
    cloneWorkingCopy: function(next) {
        var slf = this;

        LOG.info(__filename + ' - cloning project %s (name: %s, rev: %s)', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
        this.get('repository').clone(function() {
            LOG.info(__filename + ' - project %s (name: %s, rev: %s) cloned', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
            next(null);
        });
    },
    parseInfrastructure: function(next) {
        var slf = this;

        LOG.info(__filename + ' - parsing infrastructure for project %s (name: %s, rev: %s)', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
        this.get('infrastructure').parseInfrastructure(function() {
            LOG.info(__filename + ' - infrastructure parsed for project %s (name: %s, rev: %s)', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
            next(null);
        });
    },
    buildDockerfiles: function(next) {
        var slf = this;

        LOG.info(__filename + ' - building dockerfiles for project %s (name: %s, rev: %s)', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
        this.get('infrastructure').buildDockerfiles(function() {
            var workingCopies = slf.get('workingCopies');
            var name = slf.get('name');

            workingCopies[name] = workingCopies[name] || {};
            workingCopies[name].infrastructure = slf.get('infrastructure');
            workingCopies[name].rev = slf.get('rev');

            LOG.info(__filename + ' - dockerfiles built for project %s (name: %s, rev: %s)', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));

            next(null);
        });
    },
    saveBuildJobs: function(next) {
        var docs = [];
        var slf = this;

        _.each(slf.get('infrastructure').get('environments'), function(variables, environment) {
            _.each(slf.get('infrastructure').get('services'), function(config, service) {
                var build = new BuildJob({
                    'projectId': slf.get('project').get('_id'),
                    'workingCopyName': slf.get('name'),
                    'workingCopyType': slf.get('type'),
                    'workingCopyRev': slf.get('rev'),
                    'service': service,
                    'environment': environment
                });
                docs.push(build);
            });
        });

        BuildJob.saveAll(docs, function(err) {
            LOG.info(__filename + ' - build jobs submitted for project %s (name: %s, rev: %s)', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
            next(err);
        });
    },
    getExecutionChain: function() {
        var slf = this;

        return [
            function(next) { slf.removeWorkingCopy(next); },
            function(next) { slf.cloneWorkingCopy(next); },
            function(next) { slf.parseInfrastructure(next); },
            function(next) { slf.buildDockerfiles(next); },
            function(next) { slf.removeWorkingCopy(next); },
            function(next) { slf.saveBuildJobs(next); }
        ];
    },
    execute: function(next) {
        var slf = this;

        LOG.info(__filename + ' - staring build for project %s (name: %s, rev: %s)', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
        async.waterfall(slf.getExecutionChain(), function(err) {
            if(!!err) {
                LOG.error(__filename + ' - ' + JSON.stringify(err));
            }

            LOG.info(__filename + ' - build for project %s (name: %s, rev: %s) triggered', slf.get('project').get('name'), slf.get('name'), slf.get('rev'));
            next(err);
        });
    }
}, {
});

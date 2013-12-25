
var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var YAML = require('js-yaml');

var Service = require('./service').Service;
var Repository = require('./repository').Repository;

module.exports.Infrastructure = Backbone.Model.extend({
    parseInfrastructure: function(callback) {
        var slf = this;

        async.waterfall([
            function(next) {

                slf.get('repository').readFile('infrastructure.yml', function(content) {
                    next(null, YAML.safeLoad(content));
                });

            },
            function(infrastructure, next) {

                var services = [];

                _.each(infrastructure.services, function(config, serviceName) {

                    services.push(function(ready) {

                        var serviceConfigName = !!config.manifest ? config.manifest : (serviceName + '.yml');

                        slf.get('repository').readFile(serviceConfigName, function(serviceContent) {

                            var service = new Service(YAML.safeLoad(serviceContent));
                            service.set(config);
                            infrastructure.services[serviceName] = service;

                            ready(null);

                        });

                    });

                });

                async.parallel(services, function() {
                    next(null, infrastructure);
                });

            }
        ], function (err, infrastructure) {
            slf.set(infrastructure);
            callback(err, slf);
        });
    },
    buildDockerfiles: function(callback) {
        var funcs = [];
        var slf = this;

        _.each(slf.get('environments'), function(environment, environmentName) {
            _.each(slf.get('services'), function(service, serviceName) {
                funcs.push(function(ready) {
                    service.buildDockerfile({
                        'environment': environmentName,
                        'variables': environment,
                        'callback': function() {
                            ready(null);
                        }
                    });
                });
            });
        });

        async.parallel(funcs, function() {
            callback();
        });
    }
});

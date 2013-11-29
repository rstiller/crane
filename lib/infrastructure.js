
var _ = require('underscore');
var async = require('async');
var LOG = require('winston');
var YAML = require('js-yaml');

var Service = require('./service').Service;
var Repository = require('./repository').Repository;

function Infrastructure(repository) {
    
    var slf = this;
    
    this.parseInfrastructure = function(callback) {
        
        async.waterfall([
            function(next) {
                
                repository.listFiles(function(files) {
                    next(null, files);
                });
                
            },
            function(files, next) {
                
                repository.readFile(files['infrastructure.yml'], function(content) {
                    next(null, files, YAML.safeLoad(content));
                });
                
            },
            function(files, infrastructure, next) {
                
                var services = [];
                
                _.each(infrastructure.services, function(config, serviceName) {
                    
                    services.push(function(ready) {
                        
                        var serviceConfigName = !!config.manifest ? config.manifest : (serviceName + '.yml');
                        
                        repository.readFile(files[serviceConfigName], function(serviceContent) {
                            
                            var service = new Service();
                            _.extend(service, config);
                            _.extend(service, YAML.safeLoad(serviceContent));
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
            
            _.extend(slf, infrastructure);
            callback(infrastructure);
            
        });
        
    };
    
    this.buildDockerfiles = function(callback) {
        
        var funcs = [];
        
        _.each(slf.environments, function(environment, environmentName) {
            _.each(slf.services, function(service, serviceName) {
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
        
    };
    
};

module.exports.Infrastructure = Infrastructure;


var _ = require('underscore');
var YAML = require('js-yaml');
var Service = require('./service');
var Repository = require('./repository').Repository;
var LOG = require('winston');

function Infrastructure(repository) {
    
    var slf = this;
    
    this.parseInfrastructure = function(callback) {
        
        repository.listFiles(function(files) {
            repository.readFile(files['infrastructure.yml'], function(content) {
                
                var infrastructure = YAML.safeLoad(content);
                var counter = _.size(infrastructure.services);
                
                _.each(infrastructure.services, function(config, serviceName) {
                    
                    var service = new Service();
                    var serviceConfigName = !!config.manifest ? config.manifest : (serviceName + '.yml');
                    
                    repository.readFile(files[serviceConfigName], function(serviceContent) {
                        
                        _.extend(service, config);
                        _.extend(service, YAML.safeLoad(serviceContent));
                        infrastructure.services[serviceName] = service;
                        
                        counter--;
                        if(counter === 0) {
                            _.extend(slf, infrastructure);
                            callback(infrastructure);
                        }
                        
                    });
                    
                });
            });
        });
    };
    
    this.buildDockerfiles = function(callback) {
        
        var counter = (_.size(slf.environments) === 0 ? 1 : _.size(slf.environments)) * (_.size(slf.services) === 0 ? 1 : _.size(slf.services));
        
        _.each(slf.environments, function(environment, environmentName) {
            _.each(slf.services, function(service, serviceName) {
                service.buildDockerfile({
                    'environment': environmentName,
                    'variables': environment,
                    'callback': function(dockerfile) {
                        
                        counter--;
                        if(counter === 0) {
                            callback();
                        }
                        
                    }
                });
            });
        });
        
    };
    
};

module.exports = Infrastructure;

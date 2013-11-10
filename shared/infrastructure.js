
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./reader', './github-url', './service', 'js-yaml', 'underscore'], function(reader, githubUrl, Service, YAML, _) {
    
    var Infrastructure = function() {
        
        var slf = this;
        
        this.fetch = function(options) {
            var infrastructureURI = githubUrl.getRawFileUrl(_.extend({
                'file': 'infrastructure.yml'
            }, options));
            
            reader(infrastructureURI, function(err, data) {
                
                var infrastructure = YAML.safeLoad(data);
                var counter = _.size(infrastructure.services);
                
                _.each(infrastructure.services, function(config, serviceName) {
                    
                    var service = new Service();
                    
                    service.fetch(_.extend({
                        'file': !!config.manifest ? config.manifest : (serviceName + '.yml')
                    }, options, {
                        'callback': function(obj) {
                            infrastructure.services[serviceName] = service;
                            _.extend(service, config);
                            
                            counter--;
                            if(counter === 0) {
                                _.extend(slf, infrastructure);
                                options.callback(infrastructure);
                            }
                        }
                    }));
                    
                });
                
            });
        };
        
        this.buildDockerfiles = function(callback) {
            
            var counter = _.size(slf.environments) * _.size(slf.services);
            
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
    
    return Infrastructure;
    
});

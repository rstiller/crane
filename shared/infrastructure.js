
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
                
                infrastructure._services = {};
                
                _.each(infrastructure.services, function(config, serviceName) {
                    
                    var service = new Service();
                    
                    service.fetch(_.extend({
                        'file': !!config.manifest ? config.manifest : (serviceName + '.yml')
                    }, options, {
                        'callback': function(obj) {
                            infrastructure._services[serviceName] = obj;
                            
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
        
    };
    
    return Infrastructure;
    
});

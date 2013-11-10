
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./reader', './github-url', 'js-yaml', 'underscore'], function(reader, githubUrl, YAML, _) {
    
    var Service = function() {
        
        var slf = this;
        
        this.fetch = function(options) {
            var url = githubUrl.getRawFileUrl(options);
            
            reader(url, function(err, data) {
                var service = YAML.safeLoad(data);
                _.extend(slf, service);
                options.callback(service);
            });
        };
        
        this.buildDockerfile = function(options) {
            
            var dockerfile = 'myDockerfile';
            
            // TODO
            
            slf.environments = slf.environments || {};
            slf.environments[options.environment] = {
                'dockerfile': dockerfile,
                'variables': options.variables
            };
            
            options.callback(dockerfile);
            
        };
        
    };
    
    return Service;
    
});

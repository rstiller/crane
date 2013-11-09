
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
        
    };
    
    return Service;
    
});

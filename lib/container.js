
var fs = require('fs');
var _ = require('underscore');

var Command = require('./command').Command;

function Container(project, workingCopy, repository, service, environment) {
    
    var slf = this;
    
    this.getTagName = function() {
        return project.name + ':' + workingCopy + '/' + service.name + '/' + environment;
    };
    
    this.build = function() {
        
        var folder = repository.folder() + '-build';
        var tagName = slf.getTagName();
        var files = project.files;
        var serviceConfig = workingCopy.infrastructure.services[service];
        var containerConfig = serviceConfig.environments[environment];
        var dockerfile = containerConfig.dockerfile;
        
        fs.mkdirSync(folder);
        
        fs.writeFileSync(folder + '/Dockerfile', dockerfile, {
            'encoding': 'utf8'
        });
        
        _.each(files, function(content, name) {
            if(!!content) {
                fs.writeFileSync(folder + '/' + name, new Buffer(content, 'base64'), {
                    'encoding': 'utf8'
                });
            }
        });
        
        new Command(null, 'docker', ['build', '-t', tagName, '.'], folder).start(function(data) {
            console.log('out:', data);
        }, function(data) {
            console.log('err:', data);
        }, function(code) {
            console.log('finished:', code);
        });
        
    };
    
}

module.exports = Container;

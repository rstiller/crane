
var _ = require('underscore');
var crypto = require('crypto');
var fs = require('fs');

var Command = require('./command').Command;

function Container(project, workingCopyName, serviceName, environment, infrastructure) {
    
    var slf = this;
    
    this.getTagName = function() {
        return project.name + ':' + workingCopyName + '/' + serviceName + '/' + environment;
    };
    
    this.folder = function() {
        return '/tmp/' + crypto.createHash('md5').update(slf.getTagName()).digest('hex');
    };
    
    this.build = function(callback) {
        
        var folder = slf.folder();
        var tagName = slf.getTagName();
        var files = project.files;
        var serviceConfig = infrastructure.services[serviceName];
        var containerConfig = serviceConfig.environments[environment];
        var dockerfile = containerConfig.dockerfile;
        
        if(fs.existsSync(folder)) {
            fs.rmdirSync(folder);
        }
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
        
        /*new Command(null, 'docker', ['build', '-t', tagName, '.'], folder).start(function(data) {
            console.log('out:', data);
        }, function(data) {
            console.log('err:', data);
        }, function(code) {
            console.log('finished:', code);
            if(!!callback) {
                callback();
            }
        });*/
        
        fs.rmdirSync(folder);
        
    };
    
}

module.exports.Container = Container;

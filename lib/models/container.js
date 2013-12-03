
var _ = require('underscore');
var crypto = require('crypto');
var fs = require('fs');

var Command = require('./command').Command;
var BuildLog = require('../../shared/build-log').BuildLog;
var removeDir = require('../util').removeDir;

function Container(project, build, infrastructure) {
    
    var slf = this;
    
    this.getTagName = function() {
        return project.name + ':' + build.workingCopyName + '/' + build.service + '/' + build.environment;
    };
    
    this.folder = function() {
        return '/tmp/' + crypto.createHash('md5').update(slf.getTagName()).digest('hex');
    };
    
    this.clone = function(callback) {
        var cloneCmd = new Command('git', ['clone', project.url, slf.folder()]);
        cloneCmd.log.enabled = true;
        cloneCmd.start(function(data) {
        }, function(data) {
        }, function(code) {
            build.successful = code === 0;
            build.addBuildLog(cloneCmd.log);
            
            var checkoutCmd = new Command('git', ['checkout', build.workingCopyName], slf.folder());
            checkoutCmd.log.enabled = true;
            checkoutCmd.start(function(data) {
            }, function(data) {
            }, function(code) {
                build.successful = code === 0;
                build.addBuildLog(checkoutCmd.log);
                
                var pullCmd = new Command('git', ['pull', 'origin', build.workingCopyName], slf.folder());
                pullCmd.log.enabled = true;
                pullCmd.start(function(data) {
                }, function(data) {
                }, function(code) {
                    build.successful = code === 0;
                    build.addBuildLog(pullCmd.log);
                    
                    var submoduleCmd = new Command('git', ['submodule', 'update', '--recursive', '--init'], slf.folder());
                    submoduleCmd.log.enabled = true;
                    submoduleCmd.start(function(data) {
                    }, function(data) {
                    }, function(code) {
                        build.successful = code === 0;
                        build.addBuildLog(submoduleCmd.log);
                        
                        if(!!callback) {
                            callback();
                        }
                    });
                });
            });
        });
    };
    
    this.build = function(callback) {
        
        var folder = slf.folder();
        var tagName = slf.getTagName();
        var serviceConfig = infrastructure.services[build.service];
        var containerConfig = serviceConfig.environments[build.environment];
        var dockerfile = containerConfig.dockerfile;
        
        if(fs.existsSync(folder)) {
            removeDir(folder);
        }
        
        slf.clone(function() {
            
            // TODO: Dockerfile relative to service manifest
            fs.writeFileSync(folder + '/Dockerfile', dockerfile, {
                'encoding': 'utf8'
            });
            
            var command = new Command('docker', ['build', '-t', tagName, '.'], slf.folder());
            command.log.enabled = true;
            command.start(function(data) {
            }, function(data) {
            }, function(code) {
                build.successful = code === 0;
                build.addBuildLog(command.log);
                removeDir(folder);
                
                if(!!callback) {
                    callback();
                }
            });
            
        });
        
    };
    
}

module.exports.Container = Container;

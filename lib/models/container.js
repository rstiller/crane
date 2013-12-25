
var _ = require('underscore');
var Backbone = require('backbone');
var crypto = require('crypto');
var fs = require('fs');

var ShellCommand = require('./shell-command').ShellCommand;
var removeDir = require('../util').removeDir;

module.exports.Container = Backbone.Model.extend({
    getTagName: function() {
        var slf = this;
        var build = slf.get('build');
        var project = slf.get('project');

        return project.get('name') + ':' + build.get('workingCopyName') + '/' + build.get('service') + '/' + build.get('environment');
    },
    folder: function() {
        return '/tmp/' + crypto.createHash('md5').update(this.getTagName()).digest('hex');
    },
    clone: function(callback) {
        var slf = this;
        var build = slf.get('build');
        var project = slf.get('project');

        var cloneCmd = new ShellCommand({
            'cmd': 'git',
            'args': ['clone', project.get('url'), slf.folder()]
        });
        cloneCmd.get('log').set('enabled', true);
        cloneCmd.start(function(data) {
        }, function(data) {
        }, function(code) {
            build.set('successful', code === 0);
            build.addLog(cloneCmd.get('log'));

            var checkoutCmd = new ShellCommand({
                'cmd': 'git',
                'args': ['checkout', build.get('workingCopyName')],
                'cwd': slf.folder()
            });
            checkoutCmd.get('log').set('enabled', true);
            checkoutCmd.start(function(data) {
            }, function(data) {
            }, function(code) {
                build.set('successful', code === 0);
                build.addLog(checkoutCmd.get('log'));

                var pullCmd = new ShellCommand({
                    'cmd': 'git',
                    'args': ['pull', 'origin', build.get('workingCopyName')],
                    'cwd': slf.folder()
                });
                pullCmd.get('log').set('enabled', true);
                pullCmd.start(function(data) {
                }, function(data) {
                }, function(code) {
                    build.set('successful', code === 0);
                    build.addLog(pullCmd.get('log'));

                    var submoduleCmd = new ShellCommand({
                        'cmd': 'git',
                        'args': ['submodule', 'update', '--recursive', '--init'],
                        'cwd': slf.folder()
                    });
                    submoduleCmd.get('log').set('enabled', true);
                    submoduleCmd.start(function(data) {
                    }, function(data) {
                    }, function(code) {
                        build.set('successful', code === 0);
                        build.addLog(submoduleCmd.get('log'));

                        if(!!callback) {
                            callback();
                        }
                    });
                });
            });
        });
    },
    build: function(callback) {
        var slf = this;
        var build = slf.get('build');
        var folder = slf.folder();
        var tagName = slf.getTagName();
        var serviceConfig = slf.get('infrastructure').services[build.get('service')];
        var containerConfig = serviceConfig.environments[build.get('environment')];
        var dockerfile = containerConfig.dockerfile;

        if(fs.existsSync(folder)) {
            removeDir(folder);
        }

        slf.clone(function() {

            // TODO: Dockerfile relative to service manifest
            fs.writeFileSync(folder + '/Dockerfile', dockerfile, {
                'encoding': 'utf8'
            });

            var command = new ShellCommand({
                'cmd': 'docker',
                'args': ['build', '-t', tagName, '.'],
                'cwd': slf.folder()
            });
            command.get('log').set('enabled', true);
            command.start(function(data) {
            }, function(data) {
            }, function(code) {
                build.set('successful', code === 0);
                build.addLog(command.get('log'));
                removeDir(folder);

                if(!!callback) {
                    callback();
                }
            });

        });

    }
});

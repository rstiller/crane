
var _ = require('underscore');
var async = require('async');
var Backbone = require('backbone');
var crypto = require('crypto');
var fs = require('fs');

var ShellCommand = require('../../shared/shell-command').ShellCommand;
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

        var clone = build.newShellCommand({
            'cmd': 'git',
            'args': ['clone', project.get('url'), slf.folder()],
            'enabled': true
        });
        var checkout = build.newShellCommand({
            'cmd': 'git',
            'args': ['checkout', build.get('workingCopyName')],
            'cwd': slf.folder(),
            'enabled': true
        });
        var pull = build.newShellCommand({
            'cmd': 'git',
            'args': ['pull', 'origin', build.get('workingCopyName')],
            'cwd': slf.folder(),
            'enabled': true
        });
        var submodule = build.newShellCommand({
            'cmd': 'git',
            'args': ['submodule', 'update', '--recursive', '--init'],
            'cwd': slf.folder(),
            'enabled': true
        });

        async.series([
            function(next) { clone.start({     done: function(code) { next(null, code); } }); },
            function(next) { checkout.start({  done: function(code) { next(null, code); } }); },
            function(next) { pull.start({      done: function(code) { next(null, code); } }); },
            function(next) { submodule.start({ done: function(code) { next(null, code); } }); }
        ], function(err, results) {
            var successful = true;

            _.each(results, function(result) {
                successful = result === 0;
            });

            build.set('successful', successful);
            build.save();
            if(!!callback) {
                callback();
            }
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

            var dockerBuild = build.newShellCommand({
                'cmd': 'docker',
                'args': ['build', '-rm', '-t', tagName, '.'],
                'cwd': folder,
                'enabled': true
            });
            dockerBuild.start({
                done: function(code) {
                    build.set('successful', build.get('successful') | code === 0);
                    build.save();
                    removeDir(folder);

                    if(!!callback) {
                        callback();
                    }
                }
            });

        });

    }
});

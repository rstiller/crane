
var async = require('async');
var Backbone = require('backbone');
var crypto = require('crypto');
var fs = require('fs');
var LOG = require('winston');
var path = require('path');
var spawn = require('child_process').spawn;

var ShellCommand = require('../../shared/shell-command').ShellCommand;
var removeDir = require('../util').removeDir;

module.exports.Repository = Backbone.Model.extend({
    defaults: {
        name: '',
        workingCopy: '',
        url: ''
    },
    folder: function() {
        return '/tmp/' + crypto.createHash('md5').update(this.get('name') + '-' + this.get('workingCopy')).digest('hex');
    },
    clone: function(callback) {
        var slf = this;
        var clone = new ShellCommand({
            'cmd': 'git',
            'args': ['clone', slf.get('url'), slf.folder()],
            'enabled': false
        });
        var checkout = new ShellCommand({
            'cmd': 'git',
            'args': ['checkout', slf.get('workingCopy')],
            'cwd': slf.folder(),
            'enabled': false
        });
        var pull = new ShellCommand({
            'cmd': 'git',
            'args': ['pull', 'origin', slf.get('workingCopy')],
            'cwd': slf.folder(),
            'enabled': false
        });

        async.series([
            function(next) { clone.start({     done: function(code) { next(null, code); } }); },
            function(next) { checkout.start({  done: function(code) { next(null, code); } }); },
            function(next) { pull.start({      done: function(code) { next(null, code); } }); }
        ], function(err) {
            if(!!callback) {
                callback();
            }
        });
    },
    remove: function() {
        removeDir(this.folder());
    },
    readFile: function(file, callback) {
        var filepath = path.join(this.folder(), file);
        var tmp = fs.readFileSync(filepath, {
            'encoding': 'utf8'
        });

        if(!!callback) {
            callback(tmp);
        }
    }
}, {
    remoteBranches: function(url, callback) {
        var branches = {};
        var tmp = '';
        var command = new ShellCommand({
            'cmd': 'git',
            'args': ['ls-remote', '--heads', url],
            'enabled': false
        });

        command.start({
            out: function(data) {
                tmp += data;
            },
            err: function(data) {
                LOG.error(__filename + ' - ' + data);
            },
            done: function(code) {
                if(!!callback) {
                    var lines = tmp.split('\n');
                    if(!!lines && lines.length > 0) {
                        for(var i = 0; i < lines.length; i++) {
                            var result = /\s*(\w+)\s+(.*)\s*/g.exec(lines[i]);
                            if(!!result) {
                                branches[result[2].split('refs/heads/')[1]] = result[1];
                            }
                        }
                    }
                    callback(branches);
                }
            }
        });
    },
    remoteTags: function(url, callback) {
        var tags = {};
        var tmp = '';
        var command = new ShellCommand({
            'cmd': 'git',
            'args': ['ls-remote', '--tags', url],
            'enabled': false
        });

        command.start({
            out: function(data) {
                tmp += data;
            },
            err: function(data) {
                LOG.error(__filename + ' - ' + data);
            },
            done: function(code) {
                if(!!callback) {
                    var lines = tmp.split('\n');
                    if(!!lines && lines.length > 0) {
                        for(var i = 0; i < lines.length; i++) {
                            var result = /\s*(\w+)\s+(.*)\s*/g.exec(lines[i]);
                            if(!!result) {
                                var tagName = result[2].split('refs/tags/')[1];
                                if(!/.*\^\{\}\s*$/g.exec(tagName)) {
                                    tags[tagName] = result[1];
                                }
                            }
                        }
                    }
                    callback(tags);
                }
            }
        });
    }
});

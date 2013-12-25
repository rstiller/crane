
var Backbone = require('backbone');
var crypto = require('crypto');
var fs = require('fs');
var LOG = require('winston');
var path = require('path');
var spawn = require('child_process').spawn;

var ShellCommand = require('./shell-command').ShellCommand;
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

        var cloneCmd = new ShellCommand({
            'cmd': 'git',
            'args': ['clone', slf.get('url'), slf.folder()]
        });
        cloneCmd.start(function(data) {
        }, function(data) {
        }, function(code) {

            var checkoutCmd = new ShellCommand({
                'cmd': 'git',
                'args': ['checkout', slf.get('workingCopy')],
                'cwd': slf.folder()
            });
            checkoutCmd.start(function(data) {
            }, function(data) {
            }, function(code) {

                var pullCmd = new ShellCommand({
                    'cmd': 'git',
                    'args': ['pull', 'origin', slf.get('workingCopy')],
                    'cwd': slf.folder()
                });
                pullCmd.start(function(data) {
                }, function(data) {
                }, function(code) {

                    if(!!callback) {
                        callback();
                    }

                });

            });

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

        new ShellCommand({
            'cmd': 'git',
            'args': ['ls-remote', '--heads', url]
        }).start(function(data) {
            tmp += data;
        }, function(data) {
            LOG.error(__filename + ' - ' + data);
        }, function(code) {
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
        });
    },
    remoteTags: function(url, callback) {
        var tags = {};
        var tmp = '';

        new ShellCommand({
            'cmd': 'git',
            'args': ['ls-remote', '--tags', url]
        }).start(function(data) {
            tmp += data;
        }, function(data) {
            LOG.error(__filename + ' - ' + data);
        }, function(code) {
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
        });
    }
});

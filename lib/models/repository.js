
var crypto = require('crypto');
var fs = require('fs');
var LOG = require('winston');
var path = require('path');
var spawn = require('child_process').spawn;

var Command = require('./command').Command;
var removeDir = require('../util').removeDir;

function Repository(name, workingCopy, url) {

    var slf = this;

    this.url = url;
    this.name = name;
    this.workingCopy = workingCopy;

    this.folder = function() {
        return '/tmp/' + crypto.createHash('md5').update(name + '-' + workingCopy).digest('hex');
    };

    this.clone = function(callback) {
        var cloneCmd = new Command('git', ['clone', slf.url, slf.folder()]);
        cloneCmd.start(function(data) {
        }, function(data) {
        }, function(code) {

            var checkoutCmd = new Command('git', ['checkout', slf.workingCopy], slf.folder());
            checkoutCmd.start(function(data) {
            }, function(data) {
            }, function(code) {

                var pullCmd = new Command('git', ['pull', 'origin', slf.workingCopy], slf.folder());
                pullCmd.start(function(data) {
                }, function(data) {
                }, function(code) {

                    if(!!callback) {
                        callback();
                    }

                });

            });

        });
    };

    this.remove = function() {
        removeDir(slf.folder());
    };

    this.readFile = function(file, callback) {
        var filepath = path.join(slf.folder(), file);
        var tmp = fs.readFileSync(filepath, {
            'encoding': 'utf8'
        });

        if(!!callback) {
            callback(tmp);
        }
    };

}

Repository.remoteBranches = function(url, callback) {
    var branches = {};
    var tmp = '';

    new Command('git', ['ls-remote', '--heads', url]).start(function(data) {
        tmp += data;
    }, function(data) {
        LOG.error(data);
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
};

Repository.remoteTags = function(url, callback) {
    var tags = {};
    var tmp = '';

    new Command('git', ['ls-remote', '--tags', url]).start(function(data) {
        tmp += data;
    }, function(data) {
        LOG.error(data);
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
};

module.exports.Repository = Repository;

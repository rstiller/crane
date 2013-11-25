
var spawn = require('child_process').spawn;
var crypto = require('crypto');
var Command = require('./command').Command;

function Repository(name, workingCopy, url) {
    
    var slf = this;
    
    this.url = url;
    this.name = name;
    this.workingCopy = workingCopy;
    
    this.folder = function() {
        return '/tmp/' + crypto.createHash('md5').update(name + '-' + workingCopy).digest('hex');
    };
    
    this.clone = function(log, callback) {
        if(!callback) {
            callback = log;
        }
        
        new Command(log, 'git', ['clone', '--recursive', '--depth=1', '--bare', '-b', workingCopy, slf.url, slf.folder()]).start(function(data) {
            // TODO
        }, function(data) {
            // TODO
        }, function(code) {
            // TODO
            if(!!callback) {
                callback();
            }
        });
    };
    
    this.remove = function() {
        new Command(null, 'rm', ['-fr', slf.folder()]).start();
    };
    
    this.readFile = function(file, callback) {
        var tmp = '';
        
        new Command(null, 'git', ['cat-file', 'blob', file], slf.folder()).start(function(data) {
            tmp += data;
        }, null, function(code) {
            if(!!callback) {
                callback(tmp);
            }
        });
    };
    
    this.listFiles = function(callback) {
        var files = {};
        var tmp = '';
        
        new Command(null, 'git', ['rev-list', '--objects', '--all'], slf.folder()).start(function(data) {
            tmp += data;
        }, null, function(code) {
            if(!!callback) {
                var lines = tmp.split('\n');
                if(!!lines && lines.length > 0) {
                    for(var i = 0; i < lines.length; i++) {
                        var result = /\s*(\w+)\s+(.*)\s*/g.exec(lines[i]);
                        if(!!result) {
                            files[result[2]] = result[1];
                        }
                    }
                }
                callback(files);
            }
        });
    };
    
}

Repository.remoteBranches = function(url, callback) {
    var branches = {};
    var tmp = '';
    
    new Command(null, 'git', ['ls-remote', '--heads', url]).start(function(data) {
        tmp += data;
    }, null, function(code) {
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
    
    new Command(null, 'git', ['ls-remote', '--tags', url]).start(function(data) {
        tmp += data;
    }, null, function(code) {
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


var spawn = require('child_process').spawn;

var BuildLog = require('../../shared/build-log').BuildLog;

function Command(cmd, args, cwd) {
    
    var slf = this;
    
    this.cmd = cmd;
    this.args = args;
    this.cwd = cwd;
    this.log = new BuildLog(cmd + ' ' + args.join(' '));
    
    this.start = function(outCallback, errCallback, finishCallback) {
        
        slf.log.started = new Date();
        slf.log.update(function() {
            
            slf.process = spawn(cmd, args, {
                'cwd': slf.cwd || '.'
            });
            
            slf.process.stdout.setEncoding('utf8');
            slf.process.stdout.on('data', function(data) {
                slf.log.updateOut(data);
                
                if(!!outCallback) {
                    outCallback(data);
                }
            });
            
            slf.process.stderr.setEncoding('utf8');
            slf.process.stderr.on('data', function(data) {
                slf.log.updateErr(data);
                
                if(!!errCallback) {
                    errCallback(data);
                }
            });
            
            slf.process.on('close', function(code) {
                slf.log.exitCode = code;
                slf.log.finished = new Date();
                slf.log.update();
                
                if(!!finishCallback) {
                    finishCallback(code);
                }
            });
            
            slf.process.on('error', function() {
                slf.log.updateErr('');
                
                if(!!errCallback) {
                    errCallback();
                }
            });
            
        });
        
    };
    
}

module.exports.Command = Command;

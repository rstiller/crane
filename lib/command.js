
var spawn = require('child_process').spawn;

function Command(log, cmd, args, cwd) {
    
    var slf = this;
    
    this.log = log;
    this.cmd = cmd;
    this.args = args
    this.cwd = cwd;
    
    this.start = function(outCallback, errCallback, finishCallback) {
        
        slf.process = spawn(cmd, args, {
            'cwd': slf.cwd || '.'
        });
        slf.process.stdout.setEncoding('utf8');
        slf.process.stdout.on('data', function(data) {
            if(!!outCallback) {
                outCallback(data);
            }
        });
        slf.process.stderr.setEncoding('utf8');
        slf.process.stderr.on('data', function(data) {
            if(!!errCallback) {
                errCallback(data);
            }
        });
        slf.process.on('close', function(code) {
            if(!!finishCallback) {
                finishCallback(code);
            }
        });
        
    };
    
}

module.exports.Command = Command;


var spawn = require('child_process').spawn;

function execute(cmd, args, callback) {
    
    var process = spawn(cmd, args);
    
    process.stdout.on('data', function (data) {
        callback(false, 'out', data);
    });
    
    process.stderr.on('data', function (data) {
        callback(false, 'err', data);
    });
    
    process.on('close', function (code) {
        callback(true);
    });
    
}

module.exports = execute;

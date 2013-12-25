
var Backbone = require('backbone');
var spawn = require('child_process').spawn;

var CommandLog = require('../../shared/command-log').CommandLog;

module.exports.ShellCommand = Backbone.Model.extend({
    defaults: {
        cmd: '',
        args: '',
        cwd: ''
    },
    initialize: function() {
        this.set('log', new CommandLog(this.get('cmd') + ' ' + this.get('args').join(' ')));
    },
    start: function(outCallback, errCallback, finishCallback) {
        var slf = this;

        slf.get('log').set('started', new Date());
        slf.get('log').save({
            success: function() {

                slf.process = spawn(slf.get('cmd'), slf.get('args'), {
                    'cwd': slf.get('cwd') || '.'
                });

                slf.process.stdout.setEncoding('utf8');
                slf.process.stdout.on('data', function(data) {
                    slf.get('log').updateOut(data);

                    if(!!outCallback) {
                        outCallback(data);
                    }
                });

                slf.process.stderr.setEncoding('utf8');
                slf.process.stderr.on('data', function(data) {
                    slf.get('log').updateErr(data);

                    if(!!errCallback) {
                        errCallback(data);
                    }
                });

                slf.process.on('close', function(code) {
                    slf.get('log').set({
                        'exitCode': code,
                        'finished': new Date()
                    });
                    slf.get('log').save();

                    if(!!finishCallback) {
                        finishCallback(code);
                    }
                });

                slf.process.on('error', function() {
                    slf.get('log').updateErr('');

                    if(!!errCallback) {
                        errCallback();
                    }
                });

            }
        });

    }
});

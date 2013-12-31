
(function() {

    var _ = null;
    var AbstractJob = null;
    var ShellCommand = null;

    function Factory() {

        return AbstractJob.extend({
            defaults: _.extend({}, AbstractJob.prototype.defaults, {
                projectId: '',
                workingCopyName: '',
                workingCopyType: '',
                workingCopyRev: '',
                service: '',
                environment: '',
                type: 'build-job'
            })
        }, {
            TYPE: 'build-job'
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        AbstractJob = require('./abstract-job').AbstractJob;
        ShellCommand = require('./shell-command').ShellCommand;

        module.exports.BuildJob = Factory();
    } else {
        angular.module('shared.entities').factory('BuildJob', ['_', 'AbstractJob', 'ShellCommand', function(a, b, c) {
            _ = a;
            AbstractJob = b;
            ShellCommand = c;

            return Factory();
        }]);
    }

})();


(function() {

    var _ = null;
    var AbstractJob = null;

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

        module.exports.BuildJob = Factory();
    } else {
        angular.module('shared.entities').factory('BuildJob', ['_', 'AbstractJob', function(a, b) {
            _ = a;
            AbstractJob = b;

            return Factory();
        }]);
    }

})();

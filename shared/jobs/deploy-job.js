
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
                machineGroupId: '',
                type: 'deploy-job'
            })
        }, {
            TYPE: 'deploy-job'
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        AbstractJob = require('./abstract-job').AbstractJob;

        module.exports.DeployJob = Factory();
    } else {
        angular.module('shared.entities').factory('DeployJob', ['_', 'AbstractJob', function(a, b) {
            _ = a;
            AbstractJob = b;

            return Factory();
        }]);
    }

})();

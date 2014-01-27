
(function() {

    var _ = null;
    var AbstractJob = null;

    function Factory() {

        return AbstractJob.extend({
            defaults: _.extend({}, AbstractJob.prototype.defaults, {
                machineGroupId: '',
                machineIndex: '',
                type: 'machine-info-job'
            })
        }, {
            TYPE: 'machine-info-job'
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        AbstractJob = require('./abstract-job').AbstractJob;

        module.exports.MachineInfoJob = Factory();
    } else {
        angular.module('shared.entities').factory('MachineInfoJob', ['_', 'AbstractJob', function(a, b) {
            _ = a;
            AbstractJob = b;

            return Factory();
        }]);
    }

})();

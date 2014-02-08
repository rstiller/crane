
(function() {

    var _ = null;
    var AbstractJob = null;

    function Factory() {

        return AbstractJob.extend({
            defaults: _.extend({}, AbstractJob.prototype.defaults, {
            	repository: '',
            	registry: 'https://index.docker.io',
                type: 'pull-job'
            })
        }, {
            TYPE: 'pull-job'
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        AbstractJob = require('./abstract-job').AbstractJob;

        module.exports.PullJob = Factory();
    } else {
        angular.module('shared.entities').factory('PullJob', ['_', 'AbstractJob', function(a, b) {
            _ = a;
            AbstractJob = b;

            return Factory();
        }]);
    }

})();

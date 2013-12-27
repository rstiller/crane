
(function() {

    var _ = null;
    var async = null;
    var AbstractJob = null;
    var DBS = null;

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
        async = require('async');
        AbstractJob = require('./abstract-job').AbstractJob;
        DBS = require('../lib/dbs');

        module.exports.BuildJob = Factory();
    } else {
        angular.module('shared.entities').factory('BuildJob', ['_', 'async', 'AbstractJob', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            AbstractJob = c;
            DBS = d;

            return Factory();
        }]);
    }

})();

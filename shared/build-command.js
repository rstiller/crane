
(function() {

    var _ = null;
    var async = null;
    var Command = null;
    var DBS = null;

    function Factory() {

        return Command.extend({
            defaults: _.extend({}, Command.prototype.defaults, {
                projectId: '',
                workingCopyName: '',
                workingCopyType: '',
                workingCopyRev: '',
                service: '',
                environment: '',
                type: 'build-command'
            })
        }, {
            TYPE: 'build-command'
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        Command = require('./command').Command;
        DBS = require('../lib/dbs');

        module.exports.BuildCommand = Factory();
    } else {
        angular.module('shared.entities').factory('BuildCommand', ['_', 'async', 'Command', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            Command = c;
            DBS = d;

            return Factory();
        }]);
    }

})();


(function() {

    var _ = null;
    var Backbone = null;

    function Factory() {

        var Runtime = {
            LXC: 'lxc',
            DOCKER: 'docker'
        };

        return Backbone.Model.extend({
            defaults: _.extend({}, Backbone.Model.prototype.defaults, {
                address: '',
                username: '',
                password: '',
                port: 22,
                runtime: Runtime.DOCKER
            })
        }, {
            RUNTIME: Runtime
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        Backbone = require('backbone');

        module.exports.Machine = Factory();
    } else {
        angular.module('shared.entities').factory('Machine', ['_', 'backbone', function(a, b) {
            _ = a;
            Backbone = b;

            return Factory();
        }]);
    }

})();

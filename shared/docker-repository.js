
(function() {

    var _ = null;
    var Backbone = null;

    function Factory() {
    	
        return Backbone.Model.extend({
            defaults: _.extend({}, Backbone.Model.prototype.defaults, {
            	name: null,
            	images: []
            })
        }, {
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        Backbone = require('backbone');

        module.exports.DockerRepository = Factory();
    } else {
        angular.module('shared.entities').factory('DockerRepository', ['_', 'backbone', function(a, b) {
            _ = a;
            Backbone = b;

            return Factory();
        }]);
    }

})();

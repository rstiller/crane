
(function() {

    var _ = null;
    var Backbone = null;

    function Factory() {
    	
        return Backbone.Model.extend({
            defaults: _.extend({}, Backbone.Model.prototype.defaults, {
            	id: null,
            	parent: null,
            	created: null,
            	size: null,
            	virtualSize: null,
            	tags: []
            })
        }, {
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        Backbone = require('backbone');

        module.exports.DockerImage = Factory();
    } else {
        angular.module('shared.entities').factory('DockerImage', ['_', 'backbone', function(a, b) {
            _ = a;
            Backbone = b;

            return Factory();
        }]);
    }

})();


(function() {

    var _ = null;
    var Backbone = null;
    var $ = null;
    var host = '';

    function Factory() {
    	
        return Backbone.Model.extend({
            defaults: _.extend({}, Backbone.Model.prototype.defaults, {
            	username: null,
            	password: null,
            	namespace: null
            }),
            login: function() {
            	// TODO
            },
            logout: function() {
            	// TODO
            },
            ping: function(options) {
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/_ping'
            	}));
            },
            deleteRepository: function(repository, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/repositories/' + slf.get('namespace') + '/' + repository + '/',
            		type: 'DELETE'
            	}));
            },
            tag: function(repository, tag, commit, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/repositories/' + slf.get('namespace') + '/' + repository + '/tags/' + tag,
            		data: JSON.stringify(commit),
            		type: 'PUT'
            	}));
            },
            deleteTag: function(repository, tag, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/repositories/' + slf.get('namespace') + '/' + repository + '/tags/' + tag,
            		type: 'DELETE'
            	}));
            },
            getTagCommit: function(repository, tag, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/repositories/' + slf.get('namespace') + '/' + repository + '/tags/' + tag
            	}));
            },
            getTags: function(repository, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/repositories/' + slf.get('namespace') + '/' + repository + '/tags'
            	}));
            },
            getImageAncestry: function(imageId, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/images/' + imageId + '/ancestry'
            	}));
            },
            getImage: function(imageId, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/images/' + imageId + '/json'
            	}));
            },
            setImage: function(imageId, image, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/images/' + imageId + '/json',
            		data: JSON.stringify(image),
            		type: 'PUT'
            	}));
            },
            uploadImage: function(imageId, binary, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/images/' + imageId + '/layer',
            		data: binary,
            		type: 'PUT'
            	}));
            },
            downloadImage: function(imageId, options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/v1/images/' + imageId + '/layer'
            	}));
            }
        }, {
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        $ = require('jquery');
        Backbone = require('backbone');
        host = '127.0.0.1:5000';

        module.exports.Registry = Factory();
    } else {
        angular.module('shared.entities').factory('Registry', ['_', 'jquery', 'backbone', function(a, b, c) {
            _ = a;
            $ = b;
            Backbone = c;

            return Factory();
        }]);
    }

})();

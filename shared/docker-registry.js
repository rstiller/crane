
(function() {

    var _ = null;
    var Backbone = null;
    var $ = null;
    var host = '';
    var DockerImage = null;
    var DockerRepository = null;

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
            },
            getRepositories: function(options) {
            	var slf = this;
            	
            	$.ajax(_.extend({}, options, {
            		url: host + '/_docker/images/json',
            		success: function(data, textStatus, xhr) {
            			if(!!options && !!options.success) {
            				var repositories = [];
            				var tmpRepositories = {};
            				
            				_.each(data, function(rawImage) {
            					var tags = [];
            					var repositoryName = '';
            					var image = new DockerImage({
            						created: rawImage.Created,
            						id: rawImage.Id,
            						parent: rawImage.ParentId,
            						size: rawImage.Size,
            						virtualSize: rawImage.VirtualSize
            					});
            					
            					_.each(rawImage.RepoTags, function(rawTag) {
            						var delimiterIndex = rawTag.indexOf(':');
            						var tagName = rawTag.substr(delimiterIndex + 1);
            						repositoryName = rawTag.substr(0, delimiterIndex);
            						tags.push(tagName);
            					});
            					
            					image.set('tags', tags);
            					
            					tmpRepositories[repositoryName] = tmpRepositories[repositoryName] || [];
            					tmpRepositories[repositoryName].push(image);
            				});
            				
            				_.each(tmpRepositories, function(repo, name) {
            					repositories.push(new DockerRepository({
            						name: name,
            						images: tmpRepositories[name]
            					}));
            				});
            				
            				options.success(repositories, textStatus, xhr);
            			}
            		}
            	}));
            }
        }, {
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        $ = require('jquery');
        Backbone = require('backbone');
        DockerImage = require('./docker-repository');
        DockerRepository = require('./docker-image');
        host = '127.0.0.1:5000';

        module.exports.DockerRegistry = Factory();
    } else {
        angular.module('shared.entities').factory('DockerRegistry', ['_', 'jquery', 'backbone', 'DockerImage', 'DockerRepository', function(a, b, c, d, e) {
            _ = a;
            $ = b;
            Backbone = c;
            DockerImage = d;
            DockerRepository = e;

            return Factory();
        }]);
    }

})();

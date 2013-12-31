
(function() {

    var _ = null;
    var async = null;
    var Backbone = null;
    var $ = null;
    var DBS = null;
    var prefix = '';

    function Factory() {

        return Backbone.Model.extend({
            defaults: {
                '_id': null,
                '_rev': null
            },
            idAttribute: '_id',
            initialize: function() {
                var slf = this;
                var db = slf.constructor.DB;

                slf.updateQueue = async.queue(function(task, callback) {
                    var method = slf.isNew() ? db.post : db.put;

                    method(task, function(err, response) {
                        if(!!err) {
                            callback(err);
                            return;
                        }

                        slf.set({
                            '_id': response.id,
                            '_rev': response.rev
                        });

                        callback();
                    });
                }, 1);
            },
            destroy: function(options) {
                var slf = this;
                var db = slf.constructor.DB;

                db.remove(slf.pick('_id', '_rev'), function(err, response) {
                    if(!!err) {
                        if(!!options && !!options.error) {
                            options.error(slf, err, null);
                        }
                        return;
                    }

                    if(!!options && !!options.success) {
                        options.success(slf, null, null);
                    }
                });
            },
            getKeys: function() {
                var currentParent = this.__proto__;
                var prototypes = [];
                var keys = [];

                while(!!currentParent) {
                    prototypes.push(currentParent);
                    currentParent = currentParent.__proto__;
                }

                for(var i = prototypes.length - 1; i >= 0; i--) {
                    if(!!prototypes[i].defaults) {
                        keys = _.union(keys, _.keys(prototypes[i].defaults));
                    }
                }

                return keys;
            },
            getDBObject: function() {
                var slf = this;
                var obj = _.pick(slf.attributes, slf.getKeys());

                _.each(obj, function(value, key) {
                    if(!value) {
                        delete obj[key];
                    }
                });

                return obj;
            },
            save: function(attributes, options) {
                var slf = this;

                if(!options) {
                    options = attributes;
                }

                slf.updateQueue.push(slf.getDBObject(), function(err) {
                    if(!!err && !!options && !!options.error) {
                        options.error(slf, err, null);
                        return;
                    }

                    if(!!options && !!options.success) {
                        options.success(slf, null, null);
                    }
                });
            },
            fetch: function(options) {
                var slf = this;
                var db = slf.constructor.DB;

                db.get(slf.get('_id'), function(err, doc) {
                    if(!!err && !!options && !!options.error) {
                        options.error(slf, err, null);
                        return;
                    }

                    slf.set(doc);
                    if(!!options && !!options.success) {
                        options.success(slf, null, null);
                    }
                });
            }
        }, {
            DB: DBS.DB,
            fromJson: function(json) {
                return new (this)(json);
            },
            saveAll: function(objects, callback) {
                var slf = this;
                var db = slf.DB;
                var docs = [];

                _.each(objects, function(object) {
                    docs.push(object.getDBObject());
                });

                db.bulkDocs({
                    'docs': docs
                }, function(err, response) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    _.each(objects, function(object, index) {
                        object.set({
                            '_id': response[index].id,
                            '_rev': response[index].rev
                        });
                    });

                    if(!!callback) {
                        callback(null, objects);
                    }
                });
            },
            destroyAll: function(objects, options) {
                var slf = this;
                var db = slf.DB;
                var docs = [];

                _.each(objects, function(object) {
                    docs.push(_.extend({}, _.pick(object.getDBObject(), ['_id', '_rev']), {
                        _deleted: true
                    }));
                });

                db.bulkDocs({
                    'docs': docs
                }, function(err, response) {
                    if(!!err) {
                        if(!!options && !!options.error) {
                            options.error(null, err);
                        }
                        return;
                    }

                    if(!!options && !!options.error) {
                        options.success();
                    }
                });
            },
            addNewListener: function(options) {
                var slf = this;
                var db = slf.DB;

                db.changes({
                    continuous: true,
                    filter: slf.TYPE + '/' + (options.filter || 'all'),
                    onChange: function(change) {
                        if(!change['deleted'] && !!change.changes) {
                            for(var i = 0; i < change.changes.length; i++) {
                                var revChange = change.changes[i];

                                if(revChange.rev.indexOf('1-') === 0) {
                                    if(!!options && !!options.success) {
                                        var obj = new (slf)({
                                            '_id': change.id
                                        });

                                        obj.fetch(options);
                                    }
                                }
                            }
                        }
                    }
                });
            },
            addChangeListener: function(options) {
                var slf = this;
                var db = slf.DB;

                db.changes({
                    continuous: true,
                    filter: slf.TYPE + '/' + (options.filter || 'all'),
                    onChange: function(change) {
                        if(!change['deleted']) {
                            if(!!options && !!options.success) {
                                var obj = new (slf)({
                                    '_id': change.id
                                });

                                obj.fetch(options);
                            }
                        }
                    }
                });
            },
            all: function(options) {
                var slf = this;

                slf.query({
                    view: 'all',
                    error: options.error,
                    success: function(model, response) {
                        var objects = [];

                        _.each(model.rows, function(row) {
                            objects.push(new (slf)(row.value));
                        });

                        if(!!options && !!options.success) {
                            options.success(objects, response, null);
                        }
                    }
                });
            },
            query: function(options) {
                var slf = this;
                var url = '';

                if(!!options.view) {
                    url = prefix + '/crane/_design/' + slf.TYPE + '/_view/' + options.view;
                } else if(!!options.filter) {
                    url = prefix + '/crane/_changes?filter=' + slf.TYPE + '/' + options.filter;
                }

                $.ajax(_.extend({}, options, {
                    url: url,
                    contentType: 'text/plain',
                    data: options.params,
                    success: function(data, request) {
                        var objects = JSON.parse(data);
                        if(!!options && !!options.success) {
                            options.success(objects, request, null);
                        }
                    }
                }));
            }
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        Backbone = require('backbone');
        $ = require('jquery');
        DBS = require('../lib/dbs');
        prefix = 'http://127.0.0.1:5984';

        module.exports.BaseEntity = Factory();
    } else {
        angular.module('shared.entities').factory('BaseEntity', ['_', 'async', 'backbone', 'jquery', 'DBS', function(a, b, c, d, e) {
            _ = a;
            async = b;
            Backbone = c;
            $ = d;
            DBS = e;

            return Factory();
        }]);
    }

})();

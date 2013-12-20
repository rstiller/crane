
(function() {

    var _ = null;
    var async = null;
    var Backbone = null;
    var $ = null;
    var DBS = null;

    function Factory() {

        return Backbone.Model.extend({
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
            idAttribute: '_id',
            destroy: function(options) {
                var slf = this;
                var db = slf.constructor.DB;

                db.remove(slf.pick('_id', '_rev'), function(err, response) {
                    if(!!err && !!options && !!options.error) {
                        options.error(slf, err, null);
                        return;
                    }

                    if(!!options && !!options.success) {
                        options.success(slf, null, null);
                    }
                });
            },
            save: function(attributes, options) {
                var slf = this;
                var attrs = null;

                if(!options) {
                    options = attributes;
                } else {
                    attrs = attributes;
                }

                var obj = _.clone(slf.attributes);

                if(!!attrs) {
                    _.extend(obj, attrs);
                }

                _.each(_.keys(obj), function(key) {
                    if(key[0] === '$') {
                        delete obj[key];
                    }
                });

                slf.updateQueue.push(obj, function(err) {
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
            addChangeListener: function(options) {
                var slf = this;
                var db = slf.DB;

                db.changes({
                    continuous: true,
                    filter: slf.TYPE + '/' + (options.filter || 'all'),
                    onChange: function(change) {
                        if(!!options && !!options.success) {
                            var obj = new (slf)({
                                '_id': change.id
                            });

                            obj.fetch(options);
                        }
                    }
                });
            },
            all: function(callback) {
                var slf = this;

                slf.query({
                    view: 'all',
                    success: callback
                });
            },
            fromJson: function(json) {
                return new (this)(json);
            },
            query: function(options) {
                var slf = this;
                var url = '';

                if(!!options.view) {
                    url = '/crane/_design/' + slf.TYPE + '/_view/' + options.view;
                } else if(!!options.filter) {
                    url = '/crane/_changes?filter=' + slf.TYPE + '/' + options.filter;
                }

                $.ajax({
                    url: url,
                    contentType: 'text/plain',
                    data: options.params,
                    success: function(data) {
                        var objects = JSON.parse(data);
                        if(!!options && !!options.success) {
                            options.success(objects, null, null);
                        }
                    }
                });
            }
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        Backbone = require('backbone');
        $ = require('jquery');
        DBS = require('../lib/dbs');

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

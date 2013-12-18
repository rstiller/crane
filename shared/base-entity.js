
(function() {

    var _ = null;
    var async = null;
    var Backbone = null;
    var DBS = null;

    function Factory() {

        return Backbone.Model.extend({
            initialize: function() {
                var slf = this;
                var db = slf.constructor.db;

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
                var db = slf.constructor.db;

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
                var db = slf.constructor.db;

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
            addChangeListener: function(options) {
                var slf = this;

                slf.db.changes({
                    continuous: true,
                    onChange: function(change) {
                        var obj = new (slf)({
                            '_id': change.id
                        });
                        obj.fetch(options);
                    }
                });
            },
            all: function(callback) {
                var slf = this;

                this.db.allDocs({
                    include_docs: true
                }, function(err, docs) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    if(!!callback) {
                        var objects = [];
                        _.each(docs.rows, function(row) {
                            objects.push(slf.fromJson(row.doc));
                        });
                        callback(null, objects);
                    }
                });
            },
            fromJson: function(json) {
                return new (this)(json);
            }
        });

    }

    if (typeof module !== 'undefined') {
        _ = require('underscore');
        async = require('async');
        Backbone = require('backbone');
        DBS = require('../lib/dbs');

        module.exports.BaseEntity = Factory();
    } else {
        angular.module('shared.entities').factory('BaseEntity', ['_', 'async', 'backbone', 'DBS', function(a, b, c, d) {
            _ = a;
            async = b;
            Backbone = c;
            DBS = d;

            return Factory();
        }]);
    }

})();


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
                    var method = !!slf.has('_id') ? db.put : db.post;
                    var obj = _.clone(slf.toJSON());
                    _.each(_.keys(obj), function(key) {
                        if(key[0] === '$') {
                            delete obj[key];
                        }
                    });

                    method(obj, function(err, response) {
                        if(!!err) {
                            callback(err);
                            return;
                        }

                        slf.set('_id', response.id);
                        slf.set('_rev', response.rev);

                        callback();
                    });
                }, 1);
            },
            remove: function(callback) {
                var slf = this;
                var db = slf.constructor.db;

                db.remove(slf.toJson(), function(err, response) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    if(!!callback) {
                        callback(null, slf);
                    }
                });
            },
            update: function(callback) {
                var slf = this;

                slf.updateQueue.push({}, function() {
                    if(!!callback) {
                        callback(null, slf);
                    }
                });
            }
        }, {
            addChangeListener: function(callback) {
                var slf = this;

                slf.db.changes({
                    continuous: true,
                    onChange: function(change) {
                        slf.get(change.id, function(err, doc) {
                            if(!!callback) {
                                callback(err, doc);
                            }
                        });
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
            get: function(id, callback) {
                var slf = this;

                this.db.get(id, function(err, doc) {
                    if(!!err) {
                        callback(err);
                        return;
                    }

                    if(!!callback) {
                        callback(null, slf.fromJson(doc));
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

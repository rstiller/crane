
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var PouchDB = require('pouchdb');
var LOG = require('winston');

module.exports.DB = new PouchDB('http://127.0.0.1:5984/crane');

var listDirs = function(directory) {
    var files = fs.readdirSync(directory);
    var result = [];

    _.each(files, function(file) {
        var filepath = directory + path.sep + file;
        if(fs.statSync(filepath).isDirectory()) {
        	result.push(filepath);
        }
    });

    return result;
};

var listFiles = function(directory) {
    var files = fs.readdirSync(directory);
    var result = [];

    _.each(files, function(file) {
        var filepath = directory + path.sep + file;
        if(fs.statSync(filepath).isDirectory()) {
            result = _.union(result, listFiles(filepath));
        } else {
            result.push(filepath);
        }
    });

    return result;
};

var filterFiles = function(files, extensions) {
    return _.filter(files, function(file) {
        var valid = false;
        _.each(extensions, function(extension) {
            if(path.extname(file) === extension) {
                valid = true;
            }
        });
        return valid;
    });
};

var saveDesignDoc = function(basepath, db, name) {
    var files = filterFiles(listFiles(basepath + path.sep + name), ['.js']);
    var designDoc = {
        '_id': '_design/' + name,
        'views': {},
        'filters': {},
        'shows': {},
        'lists': {}
    };

    _.each(files, function(file) {
        var basename = path.basename(file, '.js');
        if(basename.indexOf('view') === 0) {
            designDoc.views[basename.substr(5)] = {
                'map': fs.readFileSync(file, {
                    'encoding': 'utf8'
                })
            };
        } else if(basename.indexOf('filter') === 0) {
            designDoc.filters[basename.substr(7)] = fs.readFileSync(file, {
                'encoding': 'utf8'
            });
        } else if(basename.indexOf('show') === 0) {
            designDoc.shows[basename.substr(5)] = fs.readFileSync(file, {
                'encoding': 'utf8'
            });
        } else if(basename.indexOf('list') === 0) {
            designDoc.lists[basename.substr(5)] = fs.readFileSync(file, {
                'encoding': 'utf8'
            });
        }
    });

    db.allDocs({
        include_docs: true
    }, function(err, docs) {
        if(!!err) {
            console.log(err);
            return;
        }

        _.each(docs.rows, function(doc) {
            if(doc.id == designDoc._id) {
                designDoc._rev = doc.doc._rev;
            }
        });

        db.remove(designDoc, function(err) {
            if(!!err) {
                console.log(err);
            }

            delete designDoc['_rev'];

            db.post(designDoc);
        });
    });
};

var basePath = './lib/db';
var dirs = listDirs(basePath);

_.each(dirs, function(dir) {
	LOG.info(__filename + ' - initializing ' + path.basename(dir) + ' storage');
	saveDesignDoc(basePath, module.exports.DB, path.basename(dir));
});

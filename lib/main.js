
var EventEmitter = require('events').EventEmitter;
var PouchDB = require('pouchdb');
var CronJob = require('cron').CronJob;
var RevisionChecker = require('./revision-checker');
var Infrastructure = require('../shared/infrastructure');

function initDBs(host, port, onChange, onComplete) {
    
    var projects = new PouchDB('http://' + host + ':' + port + '/projects');
    var histories = new PouchDB('http://' + host + ':' + port + '/histories');
    var logs = new PouchDB('http://' + host + ':' + port + '/logs');
    var machines = new PouchDB('http://' + host + ':' + port + '/machines');
    var options = function(name) {
        return {
            'complete': function() {
                onComplete(name, arguments);
            },
            'onChange': function() {
                onChange(name, arguments);
            },
            'continuous': true
        };
    };
    
    projects.changes(options('projects'));
    histories.changes(options('histories'));
    logs.changes(options('logs'));
    machines.changes(options('machines'));
    
    return {
        'projects': projects,
        'histories': histories,
        'logs': logs,
        'machines': machines
    };
    
}

var MainApp = function() {
    
    var emitter = new EventEmitter();
    var dbs = initDBs('127.0.0.1', 5984, function(db, args) {
    }, function(db, args) {
    });
    var githubChecker = new CronJob('1 * * * * *', function() {
        RevisionChecker(dbs, emitter);
    }, function() {}, true);
    
    emitter.on('build', function(project, type, name, rev) {
        // TODO: launch child process
        var infrastructure = new Infrastructure();
        
        infrastructure.fetch({
            'project': project,
            'type': type,
            'name': name,
            'rev': rev,
            'callback': function() {
                console.log(infrastructure);
            }
        });
    });
    
};

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}

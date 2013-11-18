
var EventEmitter = require('events').EventEmitter;
var PouchDB = require('pouchdb');
var _ = require('underscore');
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
        console.log(db, args);
    }, function(db, args) {
    });
    
    emitter.on('build', function(project, branches, tags) {
        
        console.log('building dockerfiles in project', project.name, 'for branches', branches, 'and tags', tags);
        
        var counter = (_.size(branches) === 0 ? 1 : _.size(branches)) * (_.size(tags) === 0 ? 1 : _.size(tags));
        var buildInfrastructure = function(type, name, rev) {
            
            var infrastructure = new Infrastructure();
            
            infrastructure.fetch({
                'project': project,
                'type': type,
                'name': name,
                'rev': rev,
                'callback': function() {
                    
                    console.log('infrastructure file fetched in project', project.name, 'in', type, name);
                    
                    infrastructure.buildDockerfiles(function() {
                        
                        var workingCopies = {};
                        if(type === 'branch') {
                            project.branches = project.branches || {};
                            workingCopies = project.branches;
                        } else {
                            project.tags = project.tags || {};
                            workingCopies = project.tags;
                        }
                        workingCopies[name] = workingCopies[name] || {};
                        workingCopies[name].infrastructure = infrastructure;
                        workingCopies[name].rev = rev;
                        
                        counter--;
                        if(counter === 0) {
                            dbs.projects.put(project, function(err, response) {
                                if(!!err) {
                                    console.log(err);
                                    return;
                                }
                                
                                console.log('dockerfiles saved for project', project.name);
                            });
                        }
                        
                    });
                    
                }
            });
            
        };
        
        _.each(branches, function(rev, name) {
            buildInfrastructure('branch', name, rev);
        });
        
        _.each(tags, function(rev, name) {
            buildInfrastructure('tag', name, rev);
        });
        
    });
    
    new CronJob('1 * * * * *', function() {
        new RevisionChecker().check(dbs, emitter);
    }, function() {}, true);
    
};

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}

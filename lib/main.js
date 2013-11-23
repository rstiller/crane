
var CronJob = require('cron').CronJob;
var RevisionChecker = require('./revision-checker');
var DBS = require('./dbs');

var MainApp = function() {
    
    var checker = new RevisionChecker
    
    checker.check();
    new CronJob('1 * * * * *', function() {
    }, function() {}, true);
    
};

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}

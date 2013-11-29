
var CronJob = require('cron').CronJob;
var DBS = require('./dbs');
var ImageBuilder = require('./image-builder').ImageBuilder;
var RevisionChecker = require('./revision-checker').RevisionChecker;

var MainApp = function() {
    
    var checker = new RevisionChecker();
    var imageBuilder = new ImageBuilder();
    
    imageBuilder.listen();
    
    checker.check();
    new CronJob('1 * * * * *', function() {
    }, function() {}, true);
    
};

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}

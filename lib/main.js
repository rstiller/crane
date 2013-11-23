
var _ = require('underscore');
var CronJob = require('cron').CronJob;
var RevisionChecker = require('./revision-checker');
var Repository = require('./repository').Repository;
var DBS = require('./dbs');

var MainApp = function() {
    
    var checker = new RevisionChecker
    
    /*new CronJob('1 * * * * *', function() {
        checker.check();
    }, function() {}, true);*/
    
};

Repository.remoteBranches('https://github.com/rstiller/crane-example.git', function(branches) {
    //console.log('branches', branches);
});

var example = new Repository('crane-example', 'master', 'https://github.com/rstiller/crane-example.git');
example.clone(function() {
    example.listFiles(function(files) {
        console.log('files', files);
        example.readFile(files['README.md'], function(file) {
            console.log(file);
            example.remove();
        });
    });
});

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}

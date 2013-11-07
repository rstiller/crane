
var CronJob = require('cron').CronJob;

var MainApp = function() {
    
    var githubChecker = new CronJob('1 * * * * *', function(){
        
        console.log('checking for new commits');
        
    }, function() {}, true);
    
};

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}


var CronJob = require('cron').CronJob;
var express = require('express');
var Proxy = require('http-proxy').RoutingProxy;

var DBS = require('./dbs');
var Project = require('../shared/project').Project;
var ImageBuilder = require('./image-builder').ImageBuilder;
var RevisionChecker = require('./revision-checker').RevisionChecker;

var MainApp = function() {

    var checker = new RevisionChecker();
    var imageBuilder = new ImageBuilder();

    imageBuilder.listen();

    Project.addChangeListener({
        success: function() {
            checker.check();
        }
    });

    new CronJob('10 * * * * *', function() {
        checker.check();
    }, function() {}, true);

    checker.check();

    var proxy = new Proxy();

    var app = express();
    app.get('/', function(request, response){
        response.sendfile('./public/index.html');
    });
    app.use(express.static('./public'));
    app.use(function(request, response) {
        proxy.proxyRequest(request, response, {
            host: '127.0.0.1',
            port: 5984
        });
    });
    app.listen(9000, '0.0.0.0');
};

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}

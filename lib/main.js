
var CronJob = require('cron').CronJob;
var express = require('express');
var Proxy = require('http-proxy').RoutingProxy;
var LOG = require('winston');

LOG.info(__filename + ' - initializing');

var DBS = require('./dbs');
LOG.info(__filename + ' - databases loaded');

var registryMiddleware = require('./registry-middleware');
LOG.info(__filename + ' - registry-middleware loaded');

var Project = require('../shared/project').Project;
LOG.info(__filename + ' - project model loaded');

var ImageBuilder = require('./image-builder').ImageBuilder;
LOG.info(__filename + ' - image-builder loaded');

var RevisionChecker = require('./revision-checker').RevisionChecker;
LOG.info(__filename + ' - revision-checker loaded');

var MainApp = function() {

    var checker = new RevisionChecker();
    var imageBuilder = new ImageBuilder();

    imageBuilder.listen();

    Project.addNewListener({
        success: function(project) {
            checker.checkProject(project);
        }
    });

    new CronJob('*/10 * * * * *', function() {
        //checker.checkAllProjects();
    }, function() {}, true);
    LOG.info(__filename + ' - cron started');

    var proxy = new Proxy();

    var app = express();
    app.get('/', function(request, response){
        response.sendfile('./public/index.html');
    });
    app.use(express.static('./public'));
    app.use('/v1/', function(request, response) {
        proxy.proxyRequest(request, response, {
            host: '127.0.0.1',
            port: 5000
        });
    });
    app.use(registryMiddleware);
    app.use(function(request, response) {
    	proxy.proxyRequest(request, response, {
    		host: '127.0.0.1',
    		port: 5984
    	});
    });
    app.listen(9000, '0.0.0.0');
    LOG.info(__filename + ' - server started');
    
};
LOG.info(__filename + ' - initialized');

module.exports = MainApp;

if(require.main === module) {
    module.exports();
}


var spawn = require('child_process').spawn;
var requestFactory = require('request');
var LOG = require('winston');

module.exports = function(request, response, next) {
	LOG.info(__filename + ' - request.path: ' + request.url);
	var host = 'http://127.0.0.1';
	
	if(request.path.indexOf('/_docker/') === 0) {
		host += ':4243';
		request.pipe(requestFactory(host + request.url.substr('/_docker'.length))).pipe(response);
	} else if(request.path.indexOf('/_registry/') === 0) {
		host += ':5000';
		request.pipe(requestFactory(host + request.url.substr('/_registry'.length))).pipe(response);
	} else {
		next();
	}
};

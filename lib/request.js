
var http = require("http");
var https = require("https");

function request(address, success, error) {
    
    var protocol = address.protocol === "https:" ? https : http;
    var options = {
        host: address.hostname,
        path: address.path
    };
    
    protocol.get(options, function(response) {
        var buffer = '';
        
        response.on('data', function (chunk) {
            buffer += chunk;
        });
        
        response.on('end', function () {
            success(buffer);
        });
        
        response.on('close', function (err) {
            error(err);
        });
        
    }).on('error', function(err) {
        error(err);
    });
    
}

module.exports = request;

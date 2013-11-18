
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([], function() {
    
    var Reader = function(url, callback) {
        
        var window = window || null;
        
        if(!!window) {
            
            require('text!' + url, function(data) {
                callback(null, data);
            });
            
        } else {
            
            var address = require('url').parse(url);
            var http = require('http');
            var https = require('https');
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
                    callback(null, buffer);
                });
                
                response.on('close', function (err) {
                    callback(err);
                });
                
            }).on('error', function(err) {
                callback(err);
            });
            
        }
        
    };
    
    return Reader;
    
});

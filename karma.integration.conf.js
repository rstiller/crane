
module.exports = function(config) {
    
    config.set({
        basePath : '',
        frameworks : [ 'mocha' ],
        files : [ 'app/**/*.scenario.js' ],
        exclude : [],
        reporters : [ 'progress' ],
        port : 9876,
        colors : true,
        logLevel : config.LOG_INFO,
        autoWatch : false,
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers : [ 'PhantomJS' ],
        captureTimeout : 60000,
        singleRun : true
    });
    
};

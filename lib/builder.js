
var EventEmitter = require('events').EventEmitter;

function Builder() {
    
    var slf = this;
    
    this.emitter = new EventEmitter();
    
    this.build = function(projectId, type, name, rev) {
        // TODO
    };
    
    this.emitter.on('build', function(projectId, type, name, rev) {
        slf.build(projectId, type, name, rev);
    });
    
};

module.exports = Builder;

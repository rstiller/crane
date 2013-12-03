
angular.module('components.renderPipeline').factory('RenderPipeline', ['async', function(async) {
    
    function RenderPipeline(renderFunc) {
        
        var slf = this;
        
        this.renderFunc = renderFunc;
        
        this.queue = async.queue(function(task, callback) {
            
            slf.renderFunc(callback);
            
        }, 1);
        
        this.push = function() {
            slf.queue.push.apply(slf.queue, arguments);
        };
        
    }
    
    return RenderPipeline;
    
}]);

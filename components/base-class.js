/* Simple JavaScript Inheritance for ES 5.1
 * based on http://ejohn.org/blog/simple-javascript-inheritance/
 * (inspired by base2 and Prototype)
 * MIT Licensed.
 */
(function(global) {
    
    "use strict";
    
    var fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
    
    function BaseClass() {
    }
    
    BaseClass.extend = function(props) {
        
        var _super = this.prototype;
        var proto = Object.create(_super);
        
        for (var name in props) {
            
            proto[name] = typeof props[name] === "function" && typeof _super[name] == "function" && fnTest.test(props[name]) ? (function(name, fn) {
                
                return function() {
                    var tmp = this._super;
                    
                    this._super = _super[name];
                    
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    
                    return ret;
                };
                
            })(name, props[name]) : props[name];
            
        }
        
        var newClass = typeof proto.init === "function" ? proto.init : // All construction is actually done in the init method
        
        function() {
        };
        
        newClass.prototype = proto;
        proto.constructor = newClass;
        newClass.extend = BaseClass.extend;
        
        return newClass;
    };
    
    global.Class = BaseClass;
    
})(this);

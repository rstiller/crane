
angular.module('dashboard.provider').provider('PluginRegistry', function PluginRegistryProvider() {

    function PluginRegistry() {

        var slf = this;

        this.plugins = [];
        this.methods = ['getId'];

        this.get = function(id) {
            var result = null;

            angular.forEach(slf.plugins, function(plugin) {
                if(plugin.getId() === id) {
                    result = plugin;
                }
            });

            return result;
        };

        this.register = function(plugin) {
            angular.forEach(slf.methods, function(method) {
                slf.checkPluginFunction(plugin, method);
            });

            slf.plugins.push(plugin);
        };

        this.checkPluginFunction = function(plugin, method) {
            if(typeof plugin[method] !== 'function') {
                throw {
                    message: 'plugins need the ' + method + ' function'
                };
            }
        }

    }

    this.$get = [function() {
        return new PluginRegistry();
    }];

});

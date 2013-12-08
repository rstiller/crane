
angular.module('dashboard.provider').factory('Hoster', ['PluginRegistry', '$window', function(PluginRegistry, $window) {

    var registry = PluginRegistry;
    var getHost = function(url) {
        var link = $window.document.createElement('a');
        link.href = url;
        return link.hostname;
    };

    registry.methods.push('getRepositoryImageUrl');
    registry.methods.push('getBranches');
    registry.methods.push('getRepositoryInfo');
    registry.methods.push('clearCache');

    registry.get = function(url) {
        var host = getHost(url);
        var result = null;

        angular.forEach(registry.plugins, function(plugin) {
            if(host.indexOf(plugin.getId(), host.length - plugin.getId().length) !== -1) {
                result = plugin;
            }
        });

        return result;
    };

    return registry;

}]);

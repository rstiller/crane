
angular.module('dashboard.controllers').controller('BaseImagesMenuCtrl',
	['$rootScope', '$scope', '$location', 'RenderPipeline', 'Dialog', 'DockerRegistry',
	function($rootScope, $scope, $location, RenderPipeline, Dialog, DockerRegistry) {
    
    $scope.data = {
    	ready: false
    };
    var registry = new DockerRegistry();

    var renderPipeline = new RenderPipeline(function(next) {
        $scope.data.ready = false;

        registry.getRepositories({
            error: function(err) {
                console.log(err);
                next(err);
            },
            success: function(repositories) {
            	repositories.sort(function(a, b) {
            		return a.get('name') > b.get('name');
            	});
                $scope.data.images = repositories;
                $scope.data.ready = true;
                $scope.$apply();
                
                next();
            }
        });
    });
    
    renderPipeline.push({});
    
}]);

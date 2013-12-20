
angular.module('dashboard.controllers').controller('HomeOverviewCtrl',
    ['$scope', '$http', '$sce', 'marked', 'Project',
    function($scope, $http, $sce, marked, Project) {

    $scope.data = {};

    Project.query({
        view: 'all',
        success: function(projects) {
            console.log(projects);
        }
    });

    $http.get('doc/home-overview.md').success(function(data, status, headers, config) {
        marked(data, function (err, markdown) {
            $scope.data.content = $sce.trustAsHtml(markdown);
        });
    });

}]);

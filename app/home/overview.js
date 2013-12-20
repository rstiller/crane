
angular.module('dashboard.controllers').controller('HomeOverviewCtrl',
    ['$scope', '$http', '$sce', 'marked', 'Project',
    function($scope, $http, $sce, marked, Project) {

    $scope.data = {};

    new Project({
        _id: '73bf0afcaa127ffdf85301e32e08570c'
    }).getBuildCommands({
        success: function(commands) {
            console.log(commands);
        }
    });

    $http.get('doc/home-overview.md').success(function(data, status, headers, config) {
        marked(data, function (err, markdown) {
            $scope.data.content = $sce.trustAsHtml(markdown);
        });
    });

}]);

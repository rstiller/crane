
angular.module('dashboard.controllers').controller('HomeOverviewCtrl',
    ['$scope', '$http', '$sce', 'marked',
    function($scope, $http, $sce, marked) {

    $scope.data = {};

    $http.get('doc/home-overview.md').success(function(data, status, headers, config) {
        marked(data, function (err, markdown) {
            $scope.data.content = $sce.trustAsHtml(markdown);
        });
    });

}]);

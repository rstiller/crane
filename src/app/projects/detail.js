
angular.module('dashboard.controllers').controller('ProjectDetailCtrl', ['$scope', '$stateParams', 'Projects', function($scope, $stateParams, Projects) {
    
    $scope.data = {};
    
    Projects.get({
        'id': $stateParams.projectId
    }, function(project) {
        $scope.data.project = project;
    });
    
}]);

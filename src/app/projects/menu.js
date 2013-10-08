
angular.module('dashboard.controllers', ['dashboard.services']).controller('ProjectsMenuCtrl', ['$scope', 'ProjectsProvider', function($scope, ProjectsProvider) {
    
    Projects.query(function(response) {
        console.log(response);
    });
    
}]);

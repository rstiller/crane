
angular.module('dashboard.controllers').controller('ProjectsMenuCtrl', ['$scope', 'Projects', function($scope, Projects) {
    
    Projects.query(function(projects) {
    });
    
}]);


angular.module('dashboard.controllers').controller('ProjectDetailCtrl', ['$scope', '$stateParams', 'Projects', 'Cache',
                                                                         function($scope, $stateParams, Projects, Cache) {
    
    $scope.data = {};
    $scope.diagramData = {
        'name': 'master',
        'children': [
            {
                'name': 'service1',
                'children': [
                    { 'name': 'machine1', 'size': 1 },
                    { 'name': 'machine2', 'size': 1 },
                    { 'name': 'machine3', 'size': 1 }
                ]
            },
            {
                'name': 'service2',
                'children': [
                    { 'name': 'machine1', 'size': 1 },
                    { 'name': 'machine2', 'size': 1 }
                ]
            },
            {
                'name': 'service3',
                'children': [
                    { 'name': 'machine1', 'size': 1 }
                ]
            }
        ]
    };
    $scope.data.currentVersion = null;
    
    $scope.selectVersion = function(version) {
        $scope.data.currentVersion = version;
    };
    
    Projects.get({
        'id': $stateParams.projectId
    }, function(project) {
        
        $scope.data.project = project;
        $scope.data.versions = [];
        
        Cache.get(project.url, function(data) {
        });
        
        angular.forEach(project.branches, function(branch) {
            $scope.data.versions.push(branch)
        });
        angular.forEach(project.tags, function(tag) {
            $scope.data.versions.push(tag)
        });
        
    });
    
}]);

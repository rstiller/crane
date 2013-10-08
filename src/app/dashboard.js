
angular.module('dashboard.services');
angular.module('dashboard.controllers', ['dashboard.services']);
angular.module('dashboard', ['templates-main', 'ui.router', 'dashboard.services', 'dashboard.controllers']);

var dashboard = angular.module('dashboard');

dashboard.run(['$rootScope', '$state', '$stateParams', '$http', function ($rootScope, $state, $stateParams, $http) {
    
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    
    $http.defaults.headers.common['Content-Type'] = 'application/vnd.crane.v1-0-0+json';
    $http.defaults.headers.common['Accept'] = 'application/vnd.crane.v1-0-0+json';
    
}]);

dashboard.config(['$stateProvider', '$urlRouterProvider', 'ProjectsMenuCtrl', function ($stateProvider, $urlRouterProvider, ProjectsMenuCtrl) {
    
    $urlRouterProvider.otherwise('/');
    
    $stateProvider.state('home', {
        url: '/',
        views: {
            menu:    { templateUrl: 'app/home/menu.tpl.html',     controller: HomeMenuController },
            content: { templateUrl: 'app/home/overview.tpl.html', controller: HomeOverviewController }
        }
    });
    
    $stateProvider.state('container', {
        abstract: true,
        url: '/container',
        views: {
            menu:    { templateUrl: 'app/container/menu.tpl.html',     controller: ContainerMenuController },
            content: { templateUrl: 'app/container/overview.tpl.html', controller: ContainerOverviewController }
        }
    });
    
    $stateProvider.state('container.overview', {
        url: '/'
    });
    
    $stateProvider.state('container.detail', {
        url: '/:containerId',
        views: {
            content: { templateUrl: 'app/container/detail.tpl.html', controller: ContainerDetailController }
        }
    });
    
    $stateProvider.state('machines', {
        abstract: true,
        url: '/machines',
        views: {
            menu:    { templateUrl: 'app/machines/menu.tpl.html',     controller: MachineMenuController },
            content: { templateUrl: 'app/machines/overview.tpl.html', controller: MachineOverviewController }
        }
    });
    
    $stateProvider.state('machines.overview', {
        url: '/'
    });
    
    $stateProvider.state('machines.detail', {
        url: '/:machineId',
        views: {
            content: { templateUrl: 'app/machines/detail.tpl.html', controller: MachineDetailController }
        }
    });
    
    $stateProvider.state('projects', {
        abstract: true,
        url: '/projects',
        views: {
            menu:    { templateUrl: 'app/projects/menu.tpl.html',     controller: ProjectsMenuCtrl },
            content: { templateUrl: 'app/projects/overview.tpl.html', controller: ProjectOverviewController }
        }
    });
    
    $stateProvider.state('projects.overview', {
        url: '/'
    });
    
    $stateProvider.state('projects.detail', {
        url: '/:projectId',
        views: {
            content: { templateUrl: 'app/projects/detail.tpl.html', controller: ProjectDetailController }
        }
    });
    
}]);

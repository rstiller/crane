
var dashboard = angular.module('dashboard', ['templates-main', 'ui.router']);

dashboard.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    
}]);

dashboard.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    
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
            menu:    { templateUrl: 'app/projects/menu.tpl.html',     controller: ProjectMenuController },
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

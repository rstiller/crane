
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
            menu: { templateUrl: 'app/home/menu.tpl.html', controller: HomeMenuController },
            content: { templateUrl: 'app/home/overview.tpl.html', controller: HomeOverviewController }
        }
    });
    
    $stateProvider.state('projects', {
        abstract: true,
        url: '/projects',
        views: {
            menu: { templateUrl: 'app/projects/menu.tpl.html', controller: ProjectMenuController },
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

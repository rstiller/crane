
var dashboard = angular.module('dashboard');

dashboard.run(['$rootScope', '$state', '$stateParams', '$http', 'Github', function ($rootScope, $state, $stateParams, $http) {

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    /*$http.defaults.headers.common['Accept'] = 'application/vnd.crane.v1-0-0+json';
    $http.defaults.headers.common['Content-Type'] = 'application/vnd.crane.v1-0-0+json;charset=utf-8';

    $http.defaults.headers.post['Accept'] = 'application/vnd.crane.v1-0-0+json';
    $http.defaults.headers.post['Content-Type'] = 'application/vnd.crane.v1-0-0+json;charset=utf-8';

    $http.defaults.headers.put['Accept'] = 'application/vnd.crane.v1-0-0+json';
    $http.defaults.headers.put['Content-Type'] = 'application/vnd.crane.v1-0-0+json;charset=utf-8';*/

}]);

dashboard.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
        url: '/',
        views: {
            'menu@':    { templateUrl: 'app/home/menu.tpl.html',     controller: 'HomeMenuCtrl' },
            'content@': { templateUrl: 'app/home/overview.tpl.html', controller: 'HomeOverviewCtrl' }
        }
    });

    $stateProvider.state('baseImages', {
        abstract: true,
        url: '/base-images',
        views: {
            'menu@':    { templateUrl: 'app/base-images/menu.tpl.html',     controller: 'BaseImagesMenuCtrl' },
            'content@': { templateUrl: 'app/base-images/overview.tpl.html', controller: 'BaseImagesOverviewCtrl' }
        }
    });

    $stateProvider.state('baseImages.overview', {
        url: '/'
    });

    $stateProvider.state('baseImages.detail', {
        url: '/:baseImageId',
        views: {
            'content@': { templateUrl: 'app/base-images/detail.tpl.html', controller: 'BaseImagesDetailCtrl' }
        }
    });

    $stateProvider.state('machines', {
        abstract: true,
        url: '/machines',
        views: {
            'menu@':    { templateUrl: 'app/machines/menu.tpl.html',     controller: 'MachineMenuCtrl' },
            'content@': { templateUrl: 'app/machines/overview.tpl.html', controller: 'MachineOverviewCtrl' }
        }
    });

    $stateProvider.state('machines.overview', {
        url: '/'
    });

    $stateProvider.state('machines.group', {
        url: '/group/:groupId',
        views: {
            'content@': { templateUrl: 'app/machines/group.tpl.html', controller: 'GroupDetailCtrl' }
        }
    });

    $stateProvider.state('machines.machine', {
        url: '/:machineId',
        views: {
            'content@': { templateUrl: 'app/machines/machine.tpl.html', controller: 'MachineDetailCtrl' }
        }
    });

    $stateProvider.state('projects', {
        abstract: true,
        url: '/projects',
        views: {
            'menu@':    { templateUrl: 'app/projects/menu.tpl.html',     controller: 'ProjectsMenuCtrl' },
            'content@': { templateUrl: 'app/projects/overview.tpl.html', controller: 'ProjectOverviewCtrl' }
        }
    });

    $stateProvider.state('projects.overview', {
        url: '/'
    });

    $stateProvider.state('projects.detail', {
        url: '/:projectId',
        views: {
            'content@': { templateUrl: 'app/projects/detail.tpl.html', controller: 'ProjectDetailCtrl' }
        }
    });

}]);

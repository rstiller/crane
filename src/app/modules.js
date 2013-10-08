
angular.module('dashboard.services', ['ngResource']);
angular.module('dashboard.controllers', ['dashboard.services']);
angular.module('dashboard', ['templates-main', 'ui.router', 'dashboard.services', 'dashboard.controllers']);

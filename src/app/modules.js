
angular.module('dashboard.services', ['ngResource', 'components.dialog']);
angular.module('dashboard.controllers', ['ngResource', 'dashboard.services']);
angular.module('dashboard', ['templates-main', 'ui.router', 'dashboard.services', 'dashboard.controllers']);


angular.module('dashboard.utils', []);
angular.module('dashboard.services', ['ngResource', 'ngGrid', 'components.diagram', 'components.dialog', 'components.focus']);
angular.module('dashboard.controllers', ['ngResource', 'dashboard.services', 'dashboard.utils']);
angular.module('dashboard', ['templates-main', 'ui.router', 'dashboard.services', 'dashboard.controllers']);

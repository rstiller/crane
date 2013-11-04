
angular.module('dashboard.utils', []);
angular.module('dashboard.services', ['ngResource', /* 'ngGrid' */, 'components.diagram', 'components.dialog', 'components.focus', 'components.list']);
angular.module('dashboard.controllers', [/* 'kendo.directives', */'ngResource', 'dashboard.services', 'dashboard.utils']);
angular.module('dashboard', ['templates-main', 'ui.router', 'dashboard.services', 'dashboard.controllers']);

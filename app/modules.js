
angular.module('dashboard.dbs', ['components.pouchdb']);
angular.module('dashboard.utils', []);
angular.module('dashboard.services', ['ngResource', 'components.diagram', 'components.dialog', 'components.focus', 'components.list']);
angular.module('dashboard.controllers', ['ngResource', 'dashboard.services', 'dashboard.utils']);
angular.module('dashboard', ['templates-main', 'ui.router', 'dashboard.dbs', 'dashboard.services', 'dashboard.controllers']);

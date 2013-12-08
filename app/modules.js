
angular.module('dashboard.deps', [
    'components.async',
    'components.diagram',
    'components.dialog',
    'components.focus',
    'components.list',
    'components.marked',
    'components.pouchdb',
    'components.renderPipeline',
    'ng',
    'ngResource',
    'templates-main',
    'ui.router'
]);
angular.module('dashboard.dbs', [
    'dashboard.deps'
]);
angular.module('dashboard.provider', [
    'dashboard.deps'
]);
angular.module('dashboard.utils', [
    'dashboard.deps'
]);
angular.module('dashboard.services', [
    'dashboard.deps'
]);
angular.module('dashboard.widgets', [
    'dashboard.deps',
    'shared.entities'
]);
angular.module('dashboard.controllers', [
    'dashboard.deps',
    'dashboard.provider',
    'dashboard.services',
    'dashboard.utils',
    'dashboard.widgets'
]);
angular.module('dashboard', [
    'dashboard.controllers',
    'dashboard.dbs',
    'dashboard.deps',
    'dashboard.services'
]);

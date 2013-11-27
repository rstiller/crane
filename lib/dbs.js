
var PouchDB = require('pouchdb');

module.exports.Projects = new PouchDB('http://127.0.0.1:5984/projects');
module.exports.Machines = new PouchDB('http://127.0.0.1:5984/machines');
module.exports.Commands = new PouchDB('http://127.0.0.1:5984/commands');
module.exports.Builds = new PouchDB('http://127.0.0.1:5984/builds');

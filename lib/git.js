
var spawn = require('child_process').spawn;

function Branch(name) {
    this.name = name;
}

function Tag(name) {
    this.name = name;
}

function Repository(name, url) {
    
    this.url = url;
    this.name = name;
    
    this.fetch = function(callback) {
    };
    
    this.clone = function(workingCopy, callback) {
    };
    
    this.readFile = function(file, callback) {
    };
    
    this.listFiles = function(path, callback) {
    };
    
}

module.exports.Repository = Repository;
module.exports.Tag = Tag;
module.exports.Branch = Branch;

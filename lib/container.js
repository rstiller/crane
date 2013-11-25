
var fs = require('fs');

function Container(project, workingCopy, repository, service, environment) {
    
    this.build = function() {
        
        var folder = repository.folder() + '-build';
        var files = project.files;
        var serviceConfig = workingCopy.infrastructure.services[service];
        var containerConfig = serviceConfig.environments[environment];
        var dockerfile = containerConfig.dockerfile;
        
        fs.mkdirSync(folder);
        
        fs.writeFileSync(folder + '/Dockerfile', dockerfile, {
            'encoding': 'utf8'
        });
        
    };
    
}

module.exports = Container;

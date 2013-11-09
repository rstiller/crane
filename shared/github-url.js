
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([], function() {
    
    var GithubUrl = {
        'getRawRootUrl': function(options) {
            var project = options.project;
            var repo = project.url.split('github.com/')[1];
            var type = options.type;
            var name = options.name;
            var rev = options.rev;
            
            if(type === 'branch') {
                return 'https://raw.github.com/' + repo + '/' + name;
            } else {
                return 'https://raw.github.com/' + repo + '/' + rev;
            }
        },
        'getRawFileUrl': function(options) {
            return GithubUrl.getRawRootUrl(options) + '/' + options.file;
        },
        'getBranchesUrl': function(project) {
            var repo = project.url.split('github.com/')[1];
            return 'https://api.github.com/repos/' + repo + '/branches';
        },
        'getTagsUrl': function(project) {
            var repo = project.url.split('github.com/')[1];
            return 'https://api.github.com/repos/' + repo + '/tags';
        }
    };
    
    return GithubUrl;
    
});

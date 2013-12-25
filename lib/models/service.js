
var _ = require('underscore');
var Backbone = require('backbone');
var YAML = require('js-yaml');

module.exports.Service = Backbone.Model.extend({
    buildEnvironmentVariables: function(dockerfile, variables) {
        for(var key in variables) {
            dockerfile.push('ENV ' + key + ' ' + variables[key]);
        }
    },
    buildPuppetFacts: function(dockerfile) {
        var provision = this.get('provision');

        if(!!provision.facts) {
            for(var i = 0; i < provision.facts.length; i++) {
                dockerfile.push('ADD ' + provision.facts[i] + ' /etc/facter/facts.d/');
            }
        }
    },
    buildPuppetModules: function(dockerfile, modules) {
        var index = 0;
        var provision = this.get('provision');

        if(!!provision.modulePaths) {
            for(var i = 0; i < provision.modulePaths.length; i++) {
                var path = '/tmp/puppet/_modules-' + index++ + '/';
                dockerfile.push('ADD ' + provision.modulePaths[i] + ' ' + path);
            }
        }
    },
    buildPuppetManifest: function(dockerfile) {
        var provision = this.get('provision');
        dockerfile.push('ADD ' + provision.manifest + ' /tmp/puppet/_manifest/manifest.pp');
    },
    buildPuppetProvisioning: function(dockerfile) {
        var modules = [];

        this.buildPuppetFacts(dockerfile);
        this.buildPuppetModules(dockerfile, modules);
        this.buildPuppetManifest(dockerfile);

        // http://docs.puppetlabs.com/references/stable/configuration.html#modulepath
        dockerfile.push('RUN puppet apply --modulepath=' + modules.join(':') + ' /tmp/puppet/_manifest/manifest.pp');
    },
    buildShellProvisioning: function(dockerfile) {
        var provision = this.get('provision');

        if(!!provision.directories) {
            for(var i = 0; i < provision.directories.length; i++) {
                var dir = provision.directories[i];
                dockerfile.push('ADD ' + dir + ' ' + dir);
            }
        }

        if(!!slf.provision.path) {
            dockerfile.push('RUN PATH=' + provision.path.join(':') + ':$PATH');
        }

        if(!!provision.commands && provision.commands.length > 0) {
            for(var i = 0; i < provision.commands.length; i++) {
                dockerfile.push('RUN ' + provision.commands[i]);
            }
        }
    },
    buildProvisioning: function(dockerfile) {
        var provision = this.get('provision');

        if(!!provision) {
            if(provision.provider === 'puppet') {
                str = this.buildPuppetProvisioning(dockerfile);
            } else if(provision.provider === 'shell') {
                str = this.buildShellProvisioning(dockerfile);
            }
        }
    },
    buildDockerfile: function(options) {

        var dockerfile = [];

        dockerfile.push('# ' + this.get('name') + ' (' + this.get('version') + ')');
        dockerfile.push('FROM ' + this.get('base'));

        if(!!this.get('ports')) {
            dockerfile.push('EXPOSE ' + this.get('ports').join(' '));
        }

        this.buildEnvironmentVariables(dockerfile, options.variables);
        this.buildProvisioning(dockerfile);

        this.set('environments', this.get('environments') || {});
        this.get('environments')[options.environment] = {
            'dockerfile': dockerfile.join('\n')
        };

        options.callback();
    }
});

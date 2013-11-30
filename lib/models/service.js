
var _ = require('underscore');
var LOG = require('winston');
var YAML = require('js-yaml');

function Service() {
    
    var slf = this;
    
    this.buildEnvironmentVariables = function(dockerfile, variables) {
        for(var key in variables) {
            dockerfile.push('ENV ' + key + ' ' + variables[key]);
        }
    };
    
    this.buildPuppetFacts = function(dockerfile) {
        if(!!slf.provision.facts) {
            for(var i = 0; i < slf.provision.facts.length; i++) {
                dockerfile.push('ADD ' + slf.provision.facts[i] + ' /etc/facter/facts.d/');
            }
        }
    };
    
    this.buildPuppetModules = function(dockerfile, modules) {
        var index = 0;
        
        if(!!slf.provision.modulePaths) {
            for(var i = 0; i < slf.provision.modulePaths.length; i++) {
                var path = '/tmp/puppet/_modules-' + index++ + '/';
                dockerfile.push('ADD ' + slf.provision.modulePaths[i] + ' ' + path);
            }
        }
    };
    
    this.buildPuppetManifest = function(dockerfile) {
        dockerfile.push('ADD ' + slf.provision.manifest + ' /tmp/puppet/_manifest/manifest.pp');
    };
    
    this.buildPuppetProvisioning = function(dockerfile) {
        var modules = [];
        
        slf.buildPuppetFacts(dockerfile);
        slf.buildPuppetModules(dockerfile, modules);
        slf.buildPuppetManifest(dockerfile);
        
        // http://docs.puppetlabs.com/references/stable/configuration.html#modulepath
        dockerfile.push('RUN puppet apply --modulepath=' + modules.join(':') + ' /tmp/puppet/_manifest/manifest.pp');
    };
    
    this.buildShellProvisioning = function(dockerfile) {
        
        if(!!slf.provision.directories) {
            for(var i = 0; i < slf.provision.directories.length; i++) {
                var dir = slf.provision.directories[i];
                dockerfile.push('ADD ' + dir + ' ' + dir);
            }
        }
        
        if(!!slf.provision.path) {
            dockerfile.push('RUN PATH=' + slf.provision.path.join(':') + ':$PATH');
        }
        
        if(!!slf.provision.commands && slf.provision.commands.length > 0) {
            for(var i = 0; i < slf.provision.commands.length; i++) {
                dockerfile.push('RUN ' + slf.provision.commands[i]);
            }
        }
    };
    
    this.buildProvisioning = function(dockerfile) {
        if(!!slf.provision) {
            if(slf.provision.provider === 'puppet') {
                str = slf.buildPuppetProvisioning(dockerfile);
            } else if(slf.provision.provider === 'shell') {
                str = slf.buildShellProvisioning(dockerfile);
            }
        }
    };
    
    this.buildDockerfile = function(options) {
        
        var dockerfile = [];
        
        dockerfile.push('# ' + slf.name + ' (' + slf.version + ')');
        dockerfile.push('FROM ' + slf.base);
        
        if(!!slf.ports) {
            dockerfile.push('EXPOSE ' + slf.ports.join(' '));
        }
        
        slf.buildEnvironmentVariables(dockerfile, options.variables);
        slf.buildProvisioning(dockerfile);
        
        slf.environments = slf.environments || {};
        slf.environments[options.environment] = {
            'dockerfile': dockerfile.join('\n')
        };
        
        options.callback();
        
    };
    
}

module.exports.Service = Service;

/*
module Crane
    
    module Models
        
        require "crane/models/package"
        require "crane/util/buildProgressMonitor"
        
        Sequel::Model.db.create_table? "base_images" do
            
            primary_key :id
            DateTime :date
            String :type, :default => "custom"
            String :name
            String :version
            String :baseImage
            String :provision
            String :provisionVersion
            
        end
        
        class BaseImage < Sequel::Model
            
            TYPE_STANDARD = "standard"
            TYPE_CUSTOM = "custom"
            
            one_to_many :package
            
            def to_hash
                
                Crane::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                BaseImage.new :name => hash["name"],
                    :type => hash["type"],
                    :version => hash["version"],
                    :baseImage => hash["baseImage"],
                    :provision => hash["provision"],
                    :provisionVersion => hash["provisionVersion"]
                
            end
            
            def info
                
                response = HTTParty.get("http://localhost:4243/images/json")
                images = JSON.parse response.body
                tags = []
                
                images.each do |image|
                    
                    if image["Repository"] == name
                        tags.push image
                    end
                    
                end
                
                tags
                
            end
            
            def getPackageName(package, version)
                
                packageName = package
                
                if version
                    packageName = "#{package}=#{version}"
                end
                
            end
            
            def applyPackages(file)
                
                if !package_dataset.empty?
                    
                    file.puts "RUN apt-get update -q"
                    
                    package_dataset.each do |package|
                        
                        packageName = getPackageName package.name, package.version
                        
                        file.puts "RUN apt-get install -f -y --force-yes --no-install-recommends #{packageName}"
                        
                    end
                    
                end
                
            end
            
            def applyPuppetProvisioning(file)
                
                puppetCommon = getPackageName "puppet-common", provisionVersion
                puppet = getPackageName "puppet", provisionVersion
                
                file.puts "RUN apt-get install wget -y"
                file.puts "RUN wget http://apt.puppetlabs.com/puppetlabs-release-`lsb_release -cs`.deb; dpkg -i puppetlabs-release-`lsb_release -cs`.deb"
                file.puts "RUN apt-get update -q"
                file.puts "RUN apt-get install -f -y --force-yes --no-install-recommends #{puppetCommon} #{puppet}"
                
            end
            
            def generateDockerfile
                
                folder = Digest::MD5.hexdigest "#{name}-#{version}"
                folder = "#{Settings['paths.baseImages']}/#{folder}"
                
                unless File.directory? folder
                    
                    FileUtils.mkdir_p folder
                        
                end
                
                dockerfile = "#{folder}/Dockerfile"
                
                File.open dockerfile, "w:UTF-8" do |file|
                    
                    file.puts "# #{name} (#{version})"
                    file.puts "FROM #{baseImage}"
                    
                    applyPackages file
                    
                    if provision == "puppet"
                        
                        applyPuppetProvisioning file
                        
                    end
                    
                end
                
                dockerfile
                
            end
            
            def buildImage
                
                dockerfile = generateDockerfile
                Crane::log.info "building baseImage #{name} (#{version}) from #{dockerfile}"
                
                lineCount = File.open(dockerfile).readlines.length
                
                input, output, error, waiter = Crane::Docker.build dockerfile, name, version
                
                out = ""
                
                monitor = Crane::BuildProgressMonitor.new out, input, output, error, waiter, lineCount - 1
                
                return monitor, out
                
            end
            
        end
        
    end
    
end
*/

/*
module Crane
    
    module Models
        
        require "loginRegistry"
        require "ipAddresses"
        require "crane/models/buildHistory"
        require "crane/models/buildOutput"
        require "crane/models/infrastructure"
        require "crane/models/runConfig"
        require "crane/models/service"
        require "crane/util/buildProgressMonitor"
        
        Sequel::Model.db.create_table? "working_copies" do
            
            primary_key :id
            foreign_key :project_id, :on_delete => :cascade
            String :name
            String :ref
            String :type
            
        end
        
        class WorkingCopy < Sequel::Model
            
            BRANCH = "branch"
            TAG = "tag"
            
            many_to_one :project
            one_to_many :buildHistory
            one_to_many :runConfig
            
            def branch?
                type == BRANCH
            end
            
            def tag?
                type == TAG
            end
            
            def to_hash
                
                Crane::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                WorkingCopy.new :name => hash["name"],
                    :ref => hash["ref"],
                    :type => hash["type"]
                
            end
            
            def clone(url)
                
                input, output, error, waiter = Git.clone url, checkoutFolder
                
                output.each {||}
                error.each {||}
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
            end
            
            def checkout
                
                input, output, error, waiter = Git.checkout name, checkoutFolder
                
                output.each {||}
                error.each {||}
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
            end
            
            def computeFolder(path)
                
                hash = Digest::MD5.hexdigest "#{project.name}-#{project.url}-#{name}"
                File.absolute_path hash, path
                
            end
            
            def clearImageFolder
                
                FileUtils.rm_rf imageFolder
                
            end
            
            def imageFolder
                
                computeFolder Settings["paths.images"]
                
            end
            
            def clearCheckoutFolder
                
                FileUtils.rm_rf checkoutFolder
                
            end
            
            def checkoutFolder
                
                computeFolder Settings["paths.repositories"]
                
            end
            
            def infrastructure
                
                infrastructureFile = File.absolute_path "infrastructure.yml", checkoutFolder
                
                if !File.exists? infrastructureFile
                    
                    raise "infrastructure file not found"
                    
                end
                
                Models::Infrastructure.new infrastructureFile
                
            end
            
            def imageRef(out, imageName, imageVersion)
                
                ref = ""
                
                Open3.popen3 "docker inspect #{imageName}:#{imageVersion}" do |input, output, error, waiter|
                    
                    jsonContent = output.read
                    
                    content = "inspect image for repository #{imageName} - tag #{imageVersion}"
                    content.concat jsonContent
                    content.concat error.read
                    out.concat content
                    
                    if waiter.value.exited?
                        
                        info = JSON.parse jsonContent
                        ref = info[0]["id"]
                        
                    end
                    
                end
                
                ref
                
            end
            
            def logAction(out, heading, output, error)
                content = heading
                content.concat output.read
                content.concat error.read
                out.concat content
            end
            
            def tagImage(out, ref, imageName, imageVersion)
                
                addresses = Crane::getEthernetAddresses
                
                addresses.each do |address|
                    
                    Open3.popen3 "docker tag #{ref} #{address}:#{Settings['registry.port']}/#{imageName} #{imageVersion}" do |input, output, error, waiter|
                        logAction out, "tag image for repository #{imageName} - tag #{imageVersion} - address #{address}", output, error
                    end
                    
                end
                
            end
            
            def publishImage(out, imageName, imageVersion)
                
                addresses = Crane::getEthernetAddresses
                
                Crane::loginRegistry proc { |output, error, returnCode|
                    
                    if returnCode.exited?
                        
                        addresses.each do |address|
                            
                            Open3.popen3 "docker push #{address}:#{Settings['registry.port']}/#{imageName} #{imageVersion}" do |input, output, error, waiter|
                                logAction out, "publish image for repository #{imageName} - tag #{imageVersion} - address #{address}", output, error
                            end
                            
                        end
                        
                    end
                    
                }
                
            end
            
            def serviceMonitor(buildOutput, buildHistory, imageName, imageVersion, input, output, error, waiter, lineCount)
                
                out = ""
                errorCallback = proc {
                    
                    buildOutput.output = out
                    buildHistory.successful = Crane::Models::BuildHistory::BUILD_BROKEN
                    buildHistory.save
                    buildOutput.save
                    
                }
                finishCallback = proc {
                    
                    ref = imageRef out, imageName, imageVersion
                    tagImage out, ref, imageName, imageVersion
                    publishImage out, imageName, imageVersion
                    
                    buildOutput.output = out
                    buildHistory.save
                    buildOutput.save
                    
                }
                
                Crane::BuildProgressMonitor.new out, input, output, error, waiter, lineCount, nil, finishCallback, errorCallback
                
            end
            
            def buildRunCommand(project, serviceConfig, serviceName, environment)
                
                runConfig = runConfig_dataset.where :serviceName => serviceName, :environment => environment
                
                imageName = getImageName serviceName
                imageVersion = getImageVersion environment
                
                if runConfig.count <= 0
                    
                    runConfig = Models::RunConfig.new :serviceName => serviceName,
                        :environment => environment,
                        :command => "docker run -d #{imageName}:#{imageVersion} -m=#{serviceConfig.options.memory}"
                    
                    add_runConfig runConfig
                    
                else
                    
                    runConfig.update :command => "docker run -d #{imageName}:#{imageVersion} -m=#{serviceConfig.options.memory}"
                    
                end
                
            end
            
            def getImageName(serviceName)
                "#{project.name}-#{serviceName}"
            end
            
            def getImageVersion(environment)
                "#{environment}-#{name}"
            end
            
            def buildServiceImage(project, infra, environment, variables, serviceName, serviceConfig, buildHistory)
                
                service = Service.new infra, serviceName, serviceConfig
                
                buildOutput = Crane::Models::BuildOutput.new :environment => environment, :serviceName => serviceName
                buildHistory.add_buildOutput buildOutput
                
                dockerfile = service.generateDockerfile self, environment, variables
                imageName = getImageName serviceName
                imageVersion = getImageVersion environment
                lineCount = File.open(dockerfile).readlines.length
                
                buildRunCommand project, service, serviceName, environment
                
                dockerfileFolder = File.dirname dockerfile
                
                input, output, error, waiter = Open3.popen3 "docker build -t #{imageName}:#{imageVersion} .", :chdir => dockerfileFolder
                
                serviceMonitor buildOutput, buildHistory, imageName, imageVersion, input, output, error, waiter, lineCount - 1
                
            end
            
            def buildEnvironment(project, infra, environment, variables, buildHistory)
                
                monitors = {}
                
                infra.services.each do |serviceName, serviceConfig|
                    
                    monitors[serviceName] = buildServiceImage project, infra, environment, variables, serviceName, serviceConfig, buildHistory
                    
                end
                
                monitors
                
            end
            
            def buildImages(project, buildHistory)
                
                monitors = {}
                    
                buildHistory.successful = Crane::Models::BuildHistory::BUILD_SUCCESSFUL
                
                clearCheckoutFolder
                clone project.url
                checkout
                
                clearImageFolder
                
                infra = infrastructure
                
                infra.environments.each do |environment, variables|
                    
                    monitors[environment] = buildEnvironment project, infra, environment, variables, buildHistory
                    
                end
                
                monitors
                
            end
            
        end
        
    end
    
end
*/

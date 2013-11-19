
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./reader', './github-url', 'js-yaml', 'underscore'], function(reader, githubUrl, YAML, _) {
    
    var Service = function() {
        
        var slf = this;
        
        this.fetch = function(options) {
            var url = githubUrl.getRawFileUrl(options);
            
            reader(url, function(err, data) {
                var service = YAML.safeLoad(data);
                _.extend(slf, service);
                options.callback(service);
            });
        };
        
        this.buildEnvironmentVariables = function(variables) {
            var str = '';
            
            for(var key in variables) {
                str += 'ENV ' + key + ' ' + variables[key];
            }
            
            return str;
        };
        
        this.buildPuppetFacts = function() {
            var str = '';
            
            if(!!slf.provision.facts) {
                for(var i = 0; i < slf.provision.facts.length; i++) {
                    // TODO: include file
                    str += 'ADD ' + slf.provision.facts[i] + ' /etc/facter/facts.d/\n';
                }
            }
            
            return str;
        };
        
        this.buildPuppetModules = function() {
            var str = '';
            
            // TODO modules
            
            return str;
        };
        
        this.buildPuppetManifest = function() {
            // TODO: add file
            return 'ADD ' + '' + ' /tmp/puppet/_manifest/manifest.pp';
        };
        
        this.buildPuppetProvisioning = function() {
            var str = '';
            var modules = slf.buildPuppetModules();
            
            str += slf.buildPuppetFacts();
            str += slf.buildPuppetManifest();
            
            // http://docs.puppetlabs.com/references/stable/configuration.html#modulepath
            str += 'RUN puppet apply --modulepath=' + modules.join(':') + ' /tmp/puppet/_manifest/manifest.pp'
            
            return str;
        };
        
        this.buildShellProvisioning = function() {
            var str = '';
            
            // TODO: directories
            
            if(!!provision.path) {
                str += 'RUN PATH=' + provision.path.join(':') + ':$PATH';
            }
            
            if(!!provision.commands && provision.commands.length > 0) {
                for(var i = 0; i < provision.commands.length; i++) {
                    str += 'RUN ' + provision.commands[i];
                }
            }
            
            return str;
        };
        
        this.buildProvisioning = function() {
            var str = '';
            
            if(!!slf.provision) {
                if(slf.provision.provider === 'puppet') {
                    str = slf.buildPuppetProvisioning();
                } else if(slf.provision.provider === 'shell') {
                    str = slf.buildShellProvisioning();
                }
            }
            
            return str;
        };
        
        this.buildDockerfile = function(options) {
            
            var dockerfile = 'myDockerfile';
            
            dockerfile += '# ' + slf.name + ' (' + slf.version + ')';
            dockerfile += 'FROM ' + slf.base;
            
            if(!!slf.ports) {
                dockerfile += 'EXPOSE ' + slf.ports.join(' ');
            }
            
            dockerfile += slf.buildEnvironmentVariables(options.variables);
            dockerfile += slf.buildProvisioning();
            
            slf.environments = slf.environments || {};
            slf.environments[options.environment] = {
                'dockerfile': dockerfile,
                'variables': options.variables
            };
            
            options.callback(dockerfile);
            
        };
        
    };
    
    return Service;
    
});
            
            /*
            module Crane
    
    module Models
        
        require "crane/util/hashToObject"
        
        class Service
            
            def initialize(infrastructure, serviceName, config)
                
                folderName = File.dirname infrastructure.file
                
                if config.has_key? "manifest"
                    
                    @file = config["manifest"]
                    
                    if !(@file =~ URI::regexp)
                        @file = "#{folderName}/#{config['manifest']}"
                    end
                    
                else
                    
                    @file = "#{folderName}/#{serviceName}.yml"
                    
                end
                
                raw = YAML.load_file @file
                
                Crane::hashToObject self, raw
                
            end
            
            def getRelativePath(checkoutDirectory, serviceManifest, source)
                
                relativeManifestPath = serviceManifest.relative_path_from checkoutDirectory
                relativeFolderPath = Pathname.new File.dirname(relativeManifestPath.to_s)
                relativeSourcePath = Pathname.new "#{relativeFolderPath.to_s}/#{source}"
                
                relativeSourcePath
                
            end
            
            def addPuppetFacts(file, checkoutPath, serviceManifest)
                
                if provision.has_key? "facts"
                    
                    provision["facts"].each do |fact|
                        
                        sourcePath = getRelativePath checkoutPath, serviceManifest, fact
                        file.puts "ADD #{sourcePath.to_s} /etc/facter/facts.d/"
                        
                    end
                    
                end
                
            end
            
            def addPuppetModules(file, checkoutPath, serviceManifest)
                
                index = 0
                modules = []
                
                if provision.has_key? "modulePaths"
                    
                    provision["modulePaths"].each do |moduleFolder|
                        
                        sourcePath = getRelativePath checkoutPath, serviceManifest, moduleFolder
                        modules.push "/tmp/puppet/_modules-#{index}/"
                        
                        file.puts "ADD #{sourcePath.to_s} /tmp/puppet/_modules-#{index}/"
                        index = index + 1
                        
                    end
                    
                end
                
                modules
                
            end
            
            def addPuppetManifest(file, checkoutPath, serviceManifest)
                
                sourcePath = getRelativePath checkoutPath, serviceManifest, provision.manifest
                file.puts "ADD #{sourcePath} /tmp/puppet/_manifest/manifest.pp"
                
            end
            
            def applyPuppetProvisioning(file, checkoutPath, serviceManifest)
                
                addPuppetFacts file, checkoutPath, serviceManifest
                modules = addPuppetModules file, checkoutPath, serviceManifest
                addPuppetManifest file, checkoutPath, serviceManifest
                
                # http://docs.puppetlabs.com/references/stable/configuration.html#modulepath
                file.puts "RUN puppet apply --modulepath=#{modules.join(':')} /tmp/puppet/_manifest/manifest.pp"
                
            end
            
            def applyShellProvisioning(file, checkoutPath, serviceManifest)
                
                provision.directories.each do |source, target|
                    
                    sourcePath = getRelativePath checkoutPath, serviceManifest, source
                    
                    file.puts "ADD #{sourcePath.to_s} #{target}"
                    
                end
                
                if !provision.path.empty?
                    
                    file.puts "RUN PATH=#{provision.path.join(':')}:$PATH"
                    
                end
                
                provision.commands.each do |command|
                    
                    file.puts "RUN #{command}"
                    
                end
                
            end
            
            def copyCheckoutFolder(workingCopy, folder)
                
                Dir.foreach workingCopy.checkoutFolder do |file|
                    
                    if file != "." && file != ".."
                        
                        FileUtils::cp_r "#{workingCopy.checkoutFolder}/#{file}", folder
                        
                    end
                    
                end
                
            end
            
            def calculateFolder(workingCopy, environment)
                
                folder = Digest::MD5.hexdigest "#{workingCopy.project.name}-#{workingCopy.name}-#{name}-#{environment}"
                folder = "#{workingCopy.imageFolder}/#{folder}"
                
                unless File.directory? folder
                    
                    FileUtils.mkdir_p folder
                        
                end
                
                folder
                
            end
            
            def applyEnvironmentVariables(file, variables)
                
                variables.each do |key, value|
                    
                    file.puts "ENV #{key} #{value}"
                    
                end
                
            end
            
            def applyProvisioning(file, checkoutPath, filePath)
                
                if provision
                    
                    if provision.provider == "puppet"
                        
                        applyPuppetProvisioning file, checkoutPath, filePath
                        
                    elsif provision.provider == "shell"
                        
                        applyShellProvisioning file, checkoutPath, filePath
                        
                    end
                    
                end
                
            end
            
            def generateDockerfile(workingCopy, environment, variables)
                
                folder = calculateFolder workingCopy, environment
                dockerfile = "#{folder}/Dockerfile"
                
                copyCheckoutFolder workingCopy, folder
                
                checkoutPath = Pathname.new workingCopy.checkoutFolder
                filePath = Pathname.new @file
                
                File.open dockerfile, "w:UTF-8" do |file|
                    
                    file.puts "# #{name} (#{version})"
                    file.puts "FROM #{base}"
                    
                    applyEnvironmentVariables file, variables
                    applyProvisioning file, checkoutPath, filePath
                    
                    file.puts "EXPOSE #{ports.join(' ')}"
                    
                end
                
                dockerfile
                
            end
            
        end
        
    end
    
end
             */

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

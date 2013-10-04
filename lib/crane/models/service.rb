
require "digest/md5"
require "yaml"
require "fileutils"
require "uri"
require "pathname"

module Crane
    
    module Models
        
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
                
                Crane.hashToObject self, raw
                
            end
            
            def getRelativePath(checkoutDirectory, serviceManifest, source)
                
                relativeManifestPath = serviceManifest.relative_path_from checkoutDirectory
                relativeFolderPath = Pathname.new File.dirname(relativeManifestPath.to_s)
                relativeSourcePath = Pathname.new "#{relativeFolderPath.to_s}/#{source}"
                
                relativeSourcePath
                
            end
            
            def addPuppetFacts(file, checkoutPath, serviceManifest)
                
                provision.facts.each do |fact|
                    
                    sourcePath = getRelativePath checkoutPath, serviceManifest, fact
                    file.puts "ADD #{sourcePath.to_s} /etc/facter/facts.d/"
                    
                end
                
            end
            
            def addPuppetModules(file, checkoutPath, serviceManifest)
                
                index = 0
                provision.modulePaths.each do |moduleFolder|
                    
                    sourcePath = getRelativePath checkoutPath, serviceManifest, moduleFolder
                    file.puts "ADD #{sourcePath.to_s} /tmp/puppet/_modules-#{index}/"
                    index = index + 1
                    
                end
                
            end
            
            def addPuppetManifest(file, checkoutPath, serviceManifest)
                
                sourcePath = getRelativePath checkoutPath, serviceManifest, provision.manifest
                file.puts "ADD #{sourcePath} /tmp/puppet/_manifest/manifest.pp"
                
            end
            
            def applyPuppetProvisioning(file, checkoutPath, serviceManifest)
                
                addPuppetFacts file, checkoutPath, serviceManifest
                addPuppetModules file, checkoutPath, serviceManifest
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

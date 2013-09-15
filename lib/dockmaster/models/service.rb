
require "digest/md5"
require "yaml"
require "fileutils"
require "uri"

module Dockmaster
    
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
                
                Dockmaster.hashToObject self, raw
                
            end
            
            def generateDockerfile(workingCopy, environment, variables)
                
                folder = Digest::MD5.hexdigest "#{workingCopy.project.name}-#{workingCopy.name}-#{name}-#{environment}"
                folder = "#{workingCopy.imageFolder}/#{folder}"
                
                unless File.directory? folder
                    
                    FileUtils.mkdir_p folder
                        
                end
                
                dockerfile = "#{folder}/Dockerfile"
                
                File.open dockerfile, "w:UTF-8" do |file|
                    
                    file.puts "# #{name} (#{version})"
                    file.puts "FROM #{base}"
                    
                    variables.each do |key, value|
                        
                        file.puts "ENV #{key} #{value}"
                        
                    end
                    
                    file.puts "EXPOSE #{ports.join(' ')}"
                    
                    if provision
                        
                        if provision.provider == "puppet"
                        elsif provision.provider == "shell"
                            
                            provision.directories.each do |source, target|
                                
                                sourcePath = File.dirname @file
                                sourcePath = File.absolute_path source, sourcePath
                                
                                file.puts "ADD #{sourcePath} #{target}"
                                
                            end
                            
                            if !provision.path.empty?
                                
                                file.puts "RUN PATH=#{provision.path.join(':')}:$PATH"
                                
                            end
                            
                            provision.commands.each do |command|
                                
                                file.puts "RUN #{command}"
                                
                            end
                            
                        end
                        
                    end
                    
                    # TODO: provisioning
                    
                end
                
                dockerfile
                
            end
            
        end
        
    end
    
end

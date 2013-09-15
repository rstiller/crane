
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
                    
                    file = config["manifest"]
                    
                    if !(file =~ URI::regexp)
                        file = "#{folderName}/#{config['manifest']}"
                    end
                    
                else
                    
                    file = "#{folderName}/#{serviceName}.yml"
                    
                end
                
                raw = YAML.load_file file
                
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
                    
                    # TODO: provisioning
                    
                end
                
                dockerfile
                
            end
            
        end
        
    end
    
end

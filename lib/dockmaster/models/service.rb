
require "yaml"
require "fileutils"

module Dockmaster
    
    module Models
        
        class Service
            
            def initialize(infrastructure, serviceName, config)
                
                folderName = File.dirname infrastructure.file
                
                if config.has_key? "manifest"
                    
                    file = config["manifest"]
                    
                else
                    
                    file = "#{folderName}/#{serviceName}.yml"
                    
                end
                
                raw = YAML.load_file file
                
                Dockmaster.hashToObject self, raw
                
            end
            
            def generateDockerfile(workingCopy, environment, variables)
                
                folder = "#{workingCopy.imageFolder}/#{name}/#{environment}"
                
                unless File.directory? folder
                    
                    FileUtils.mkdir_p folder
                        
                end
                
                dockerfile = "#{folder}/Dockerfile"
                
                File.open dockerfile, "w:UTF-8" do |file|
                    
                    file.puts "FROM #{base}"
                    file.puts "RUN echo #{name}"
                    file.puts "RUN echo #{description}"
                    file.puts "RUN echo #{version}"
                    file.puts "RUN echo #{category}"
                    file.puts "RUN echo #{ports}"
                    file.puts "RUN echo #{options}"
                    
                end
                
            end
            
            def buildImage(workingCopy, environment)
                
                # TODO
                
            end
            
        end
        
    end
    
end

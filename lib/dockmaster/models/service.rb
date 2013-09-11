
require "yaml"

module Dockmaster
    
    module Models
        
        class Service
            
            def initialize(file)
                
                raw = YAML.load_file file
                
                Dockmaster.hashToObject self, raw
                
            end
            
            def generateDockerfile(workingCopy, environment, variables)
                
                # TODO
                puts "generateDockerfile: #{workingCopy}, #{environment}, #{variables}"
                
            end
            
            def buildImage(workingCopy, environment)
                
                # TODO
                puts "buildImage: #{workingCopy}, #{environment}"
                
            end
            
        end
        
    end
    
end

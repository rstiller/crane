
require "yaml"

module Crane
    
    module Models
        
        require "crane/models/service"
        
        class Infrastructure
            
            def initialize(file)
                
                @file = file
                raw = YAML.load_file file
                
                Crane.hashToObject self, raw
                
            end
            
            def file
                @file
            end
            
            def services
                @services
            end
            
        end
        
    end
    
end

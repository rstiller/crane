
require "yaml"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/service"
        
        class Infrastructure
            
            def initialize(file)
                
                @file = file
                raw = YAML.load_file file
                
                Dockmaster.hashToObject self, raw
                
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

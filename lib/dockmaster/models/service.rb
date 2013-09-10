
require "yaml"

module Dockmaster
    
    module Models
        
        class Service
            
            def initialize(file)
                
                raw = YAML.load_file file
                
                Dockmaster.hashToObject self, raw
                
            end
            
        end
        
    end
    
end

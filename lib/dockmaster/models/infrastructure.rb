
require "yaml"

module Dockmaster
    
    module Models
        
        class Infrastructure
            
            def initialize(file)
                
                raw = YAML.load_file file
                
                Dockmaster.hashToObject self, raw
                
            end
            
        end
        
    end
    
end


require "yaml"

module Dockmaster
    
    module Models
        
        class Service
            
            def initialize(file)
                
                raw = YAML.load_file file
                
            end
            
        end
        
    end
    
end

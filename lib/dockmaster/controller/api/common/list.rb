
module Dockmaster
    
    module Controller
        
        class List < Hash
            
            def initialize(elements)
                
                self["elements"] = elements
                self["size"] = elements.size
                
            end
            
        end
        
    end

end

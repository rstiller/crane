
module Dockmaster
    
    module Controller
        
        class Links < Hash
            
            def initialize(hash)
                
                hash["_links"] = self
                
            end
            
        end
        
    end

end

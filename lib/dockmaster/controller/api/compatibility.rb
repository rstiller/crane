
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module Compatibility
            
            def compatible(exp)
                
                unless request.media_type.match exp
                    
                    pass
                    
                end
                
            end
            
        end
        
    end

end

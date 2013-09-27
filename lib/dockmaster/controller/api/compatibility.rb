
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module Compatibility
            
            def compatible(version)
                
                unless request.media_type.match version::REGEXP
                    
                    pass
                    
                end
                
            end
            
        end
        
    end

end

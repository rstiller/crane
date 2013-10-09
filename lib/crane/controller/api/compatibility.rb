
require "sinatra/base"

module Crane
    
    module Controller
        
        module Compatibility
            
            METHODS = ['PATCH', 'POST', 'PUT']
            
            def compatible(exp)
                
                if METHODS.include? request.request_method
                    
                    unless request.media_type.match exp
                        
                        pass
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

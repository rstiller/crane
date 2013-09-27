
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module Compatibility
                
                def compatible_v1_0_0
                    
                    unless request.media_type.match /^application\/vnd\.dockmaster\.v1-0-0\+(json|xml)/
                        
                        pass
                        
                    end
                    
                end
                
            end
            
            module Version
                
                VERSION = "1.0.0"
                
                def self.registered(app)           
                    
                    app.get "/version" do
                        
                        compatible_v1_0_0
                        
                        content_type "text/plain"
                        body VERSION
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

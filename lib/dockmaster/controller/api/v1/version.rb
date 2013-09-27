
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module Version
                
                REGEXP = /^application\/vnd\.dockmaster\.v1-0-0\+(json|xml)/
                VERSION = "1.0.0"
                
                def self.registered(app)           
                    
                    app.get "/version" do
                        
                        compatible Version::REGEXP
                        
                        content_type "text/plain"
                        body VERSION
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end


require "sinatra/base"

module Crane
    
    module Controller
        
        module V1
            
            module Version
                
                REGEXP = /^application\/vnd\.crane\.v1-0-0\+(json|xml)/
                CONTENT_TYPE_JSON = "application/vnd.crane.v1-0-0+json"
                CONTENT_TYPE_XML = "application/vnd.crane.v1-0-0+xml"
                CONTENT_TYPE_TEXT = "application/vnd.crane.v1-0-0+text"
                VERSION = "1.0.0"
                
                def self.registered(app)
                    
                    app.get "/version" do
                        
                        content_type @version::CONTENT_TYPE_TEXT
                        body @version::VERSION
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end


require "sinatra/base"

module Crane
    
    module Controller
        
        module V2
            
            module Version
                
                include Controller::V1::Version
                
                REGEXP = /^application\/vnd\.crane\.(v1-0-0|v2-0-0)\+(json|xml)/
                CONTENT_TYPE_JSON = "application/vnd.crane.v2-0-0+json"
                CONTENT_TYPE_XML = "application/vnd.crane.v2-0-0+xml"
                CONTENT_TYPE_TEXT = "application/vnd.crane.v2-0-0+text"
                VERSION = "2.0.0"
                
            end
            
        end
        
    end

end

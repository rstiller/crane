
require "sinatra/base"
require "json"
require "nokogiri"

module Dockmaster
    
    module Controller
        
        module Parser
            
            def parsePayload
                
                if request.media_type.match /.*\+json$/
                    
                    request.body.rewind
                    JSON.parse request.body.read
                    
                elsif request.media_type.match /.*\+xml$/
                    
                    request.body.rewind
                    Nokogiri::XML request.body.read
                    
                else
                    
                    halt 415, "Unsupported payload format"
                    
                end
                
            end
            
        end
        
    end

end

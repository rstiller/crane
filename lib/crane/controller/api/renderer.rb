
require "sinatra/base"

module Crane
    
    module Controller
        
        module Renderer
            
            def render(payload, status = 200)
                
                if request.media_type.match /.*\+xml$/
                    
                    halt status, { "Content-Type" => @version::CONTENT_TYPE_XML }, payload.to_xml( :root => "data" )
                    
                else
                    
                    halt status, { "Content-Type" => @version::CONTENT_TYPE_JSON }, payload.to_json
                    
                end
                
            end
            
        end
        
    end

end

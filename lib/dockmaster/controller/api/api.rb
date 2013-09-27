
require "sinatra/base"
require "sinatra/advanced_routes"

module Dockmaster
    
    module Controller
        
        class Api < Sinatra::Base
            
            require "dockmaster/controller/api/compatibility"
            require "dockmaster/controller/api/v1/version"
            require "dockmaster/controller/api/v2/version"
            
            helpers Controller::Compatibility
            
            register Sinatra::AdvancedRoutes
            register Controller::V1::Version
            register Controller::V2::Version
            
            before do
                
                if request.media_type.to_s.strip.length == 0
                    request.env["CONTENT_TYPE"] = "application/vnd.dockmaster.v1-0-0+json"
                end
                
                unless request.media_type.match Controller::V1::Version::REGEXP or
                    request.media_type.match Controller::V2::Version::REGEXP
                    
                    halt 415, "Unsupported API Version"
                    
                end
                
            end
            
            self.each_route do |route|
                Dockmaster::log.info "%6s #{route.path} #{route.file} (line #{route.line})" %[route.verb]
            end
            
        end
        
    end

end

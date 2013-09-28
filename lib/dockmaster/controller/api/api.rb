
require "sinatra/base"
require "sinatra/advanced_routes"

module Dockmaster
    
    module Controller
        
        class Api < Sinatra::Base
            
            require "dockmaster/controller/api/compatibility"
            require "dockmaster/controller/api/parser"
            require "dockmaster/controller/api/renderer"
            require "dockmaster/controller/api/v1/clientController"
            require "dockmaster/controller/api/v1/version"
            require "dockmaster/controller/api/v2/version"
            
            helpers Controller::Compatibility, Controller::Parser, Controller::Renderer
            
            register Sinatra::AdvancedRoutes
            register Controller::V1::ClientController
            register Controller::V1::Version
            register Controller::V2::Version
            
            before do
                
                if request.media_type.to_s.strip.length == 0
                    request.env["CONTENT_TYPE"] = Controller::V1::Version::CONTENT_TYPE_JSON
                end
                
                if request.media_type.match Controller::V1::Version::REGEXP
                    
                    @version = Controller::V1::Version
                    
                elsif request.media_type.match Controller::V2::Version::REGEXP
                    
                    @version = Controller::V2::Version
                    
                else
                    
                    halt 415, "Unsupported API Version"
                    
                end
                
                compatible @version::REGEXP
                
            end
            
            self.each_route do |route|
                Dockmaster::log.info "%6s #{route.path} #{route.file} (line #{route.line})" %[route.verb]
            end
            
        end
        
    end

end

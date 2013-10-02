
require "sinatra/base"
require "sinatra/advanced_routes"

module Dockmaster
    
    module Controller
        
        class Api < Sinatra::Base
            
            require "dockmaster/controller/api/compatibility"
            require "dockmaster/controller/api/linkify"
            require "dockmaster/controller/api/parser"
            require "dockmaster/controller/api/renderer"
            require "dockmaster/controller/api/v1/baseImageController"
            require "dockmaster/controller/api/v1/clientController"
            require "dockmaster/controller/api/v1/clientGroupController"
            require "dockmaster/controller/api/v1/projectController"
            require "dockmaster/controller/api/v1/version"
            require "dockmaster/controller/api/v2/version"
            
            def self.helper
                
                helpers Controller::Compatibility,
                    Controller::Linker,
                    Controller::Parser,
                    Controller::Renderer,
                    Controller::V1::BaseImageController::Helper,
                    Controller::V1::ClientGroupController::Helper,
                    Controller::V1::ProjectController::Helper
                
            end
            
            def self.controller
                
                register Sinatra::AdvancedRoutes
                register Controller::V1::BaseImageController
                register Controller::V1::ClientController
                register Controller::V1::ClientGroupController
                register Controller::V1::ProjectController
                register Controller::V1::Version
                register Controller::V2::Version
                
            end
            
            not_found do
                ""
            end
            
            error do
                Dockmaster::log.error "#{env['sinatra.error'].name}: #{env['sinatra.error'].message}"
            end
            
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
            
            helper
            controller
            
            self.each_route do |route|
                Dockmaster::log.info "%6s #{route.path} #{route.file} (line #{route.line})" %[route.verb]
            end
            
        end
        
    end

end

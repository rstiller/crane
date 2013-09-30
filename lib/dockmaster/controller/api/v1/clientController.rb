
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module ClientController
                
                require "dockmaster/controller/api/common/deleteEndpoint"
                require "dockmaster/controller/api/common/getAllEndpoint"
                require "dockmaster/controller/api/common/getEndpoint"
                require "dockmaster/controller/api/common/newEndpoint"
                require "dockmaster/controller/api/common/updateEndpoint"
                require "dockmaster/models/client"
                
                extend Controller::DeleteEndpoint
                extend Controller::GetAllEndpoint
                extend Controller::GetEndpoint
                extend Controller::NewEndpoint
                extend Controller::UpdateEndpoint
                
                def self.registered(app)
                    
                    newEndpoint app, "/clients", Dockmaster::Models::Client
                    getAllEndpoint app, "/clients", Dockmaster::Models::Client
                    getEndpoint app, "/clients/:id", Dockmaster::Models::Client
                    deleteEndpoint app, "/clients/:id", Dockmaster::Models::Client
                    updateEndpoint app, "/clients/:id", Dockmaster::Models::Client, [ "address", "dockerVersion", "dockerPort" ]
                    
                end
                
            end
            
        end
        
    end

end

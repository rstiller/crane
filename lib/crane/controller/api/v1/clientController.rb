
require "sinatra/base"

module Crane
    
    module Controller
        
        module V1
            
            module ClientController
                
                require "crane/controller/api/common/deleteEndpoint"
                require "crane/controller/api/common/getAllEndpoint"
                require "crane/controller/api/common/getEndpoint"
                require "crane/controller/api/common/newEndpoint"
                require "crane/controller/api/common/updateEndpoint"
                require "crane/controller/api/v1/clientEndpoints"
                require "crane/models/client"
                
                extend Controller::DeleteEndpoint
                extend Controller::GetAllEndpoint
                extend Controller::GetEndpoint
                extend Controller::NewEndpoint
                extend Controller::UpdateEndpoint
                extend Controller::V1::ClientEndpoints
                
                def self.registered(app)
                    
                    newEndpoint app, "/clients", Crane::Models::Client
                    getAllEndpoint app, "/clients", Crane::Models::Client
                    getEndpoint app, "/clients/:id", Crane::Models::Client
                    deleteEndpoint app, "/clients/:id", Crane::Models::Client
                    updateEndpoint app, "/clients/:id", Crane::Models::Client, [ "address", "dockerVersion", "dockerPort" ]
                    
                    containersEndpoint app, "/clients/:id/containers"
                    imagesEndpoint app, "/clients/:id/images"
                    infoEndpoint app, "/clients/:id/info"
                    
                end
                
            end
            
        end
        
    end

end

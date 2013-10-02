
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module ClientGroupController
                
                require "dockmaster/controller/api/common/deleteEndpoint"
                require "dockmaster/controller/api/common/getAllEndpoint"
                require "dockmaster/controller/api/common/getEndpoint"
                require "dockmaster/controller/api/common/newEndpoint"
                require "dockmaster/controller/api/common/relationEndpoint"
                require "dockmaster/controller/api/common/updateEndpoint"
                require "dockmaster/models/client"
                require "dockmaster/models/clientGroup"
                
                extend Controller::DeleteEndpoint
                extend Controller::GetAllEndpoint
                extend Controller::GetEndpoint
                extend Controller::NewEndpoint
                extend Controller::RelationEndpoint
                extend Controller::UpdateEndpoint
                
                module Helper
                    
                    def renderGroup(group)
                        
                        clients = group.clients
                        
                        groupHash = group.to_hash["values"]
                        groupHash["clients"] = []
                        
                        clients.each do |client|
                            
                            clientHash = client.to_hash["values"]
                            path = request.path.sub /\/clientGroups.*/, "/clients/#{clientHash[:id]}"
                            linkifyGet clientHash, path
                            
                            groupHash["clients"].push clientHash
                            
                        end
                        
                        groupHash
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    newEndpoint app, "/clientGroups", Dockmaster::Models::ClientGroup do |group, payload|
                        
                        unless payload["clients"].nil?
                            payload["clients"].each do |clientId|
                                client = Dockmaster::Models::Client[clientId]
                                group.add_client client unless client.nil?
                            end
                        end
                        
                        renderGroup group
                        
                    end
                    
                    getAllEndpoint app, "/clientGroups", Dockmaster::Models::ClientGroup do |group|
                        
                        renderGroup group
                        
                    end
                    
                    getEndpoint app, "/clientGroups/:id", Dockmaster::Models::ClientGroup do |group|
                        
                        renderGroup group
                        
                    end
                    
                    deleteEndpoint app, "/clientGroups/:id", Dockmaster::Models::ClientGroup
                    
                    updateEndpoint app, "/clientGroups/:id", Dockmaster::Models::ClientGroup, [ "name", "description" ] do |group|
                        
                        renderGroup group
                        
                    end
                    
                    relationEndpoint app, "/clientGroups/:parentId/clients/:childId", Dockmaster::Models::ClientGroup, Dockmaster::Models::Client, "client", true
                    relationEndpoint app, "/clientGroups/:parentId/clients/:childId", Dockmaster::Models::ClientGroup, Dockmaster::Models::Client, "client", false
                    
                end
                
            end
            
        end
        
    end

end

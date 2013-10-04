
require "sinatra/base"

module Crane
    
    module Controller
        
        module V1
            
            module ClientGroupController
                
                require "crane/controller/api/common/deleteEndpoint"
                require "crane/controller/api/common/getAllEndpoint"
                require "crane/controller/api/common/getEndpoint"
                require "crane/controller/api/common/newEndpoint"
                require "crane/controller/api/common/relationEndpoint"
                require "crane/controller/api/common/updateEndpoint"
                require "crane/models/client"
                require "crane/models/clientGroup"
                
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
                        
                        linkifyGet groupHash, "#{request.path}/#{group.id}"
                        
                        groupHash
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    newEndpoint app, "/clientGroups", Crane::Models::ClientGroup do |group, payload|
                        
                        unless payload["clients"].nil?
                            payload["clients"].each do |clientId|
                                client = Crane::Models::Client[clientId]
                                group.add_client client unless client.nil?
                            end
                        end
                        
                        renderGroup group
                        
                    end
                    
                    getAllEndpoint app, "/clientGroups", Crane::Models::ClientGroup do |group|
                        
                        renderGroup group
                        
                    end
                    
                    getEndpoint app, "/clientGroups/:id", Crane::Models::ClientGroup do |group|
                        
                        renderGroup group
                        
                    end
                    
                    deleteEndpoint app, "/clientGroups/:id", Crane::Models::ClientGroup
                    
                    updateEndpoint app, "/clientGroups/:id", Crane::Models::ClientGroup, [ "name", "description" ] do |group|
                        
                        renderGroup group
                        
                    end
                    
                    relationEndpoint app, "/clientGroups/:parentId/clients/:childId", Crane::Models::ClientGroup, Crane::Models::Client, "client", true
                    relationEndpoint app, "/clientGroups/:parentId/clients/:childId", Crane::Models::ClientGroup, Crane::Models::Client, "client", false
                    
                end
                
            end
            
        end
        
    end

end

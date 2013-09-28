
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module ClientGroupController
                
                require "dockmaster/controller/api/common/list"
                require "dockmaster/controller/api/common/link"
                require "dockmaster/controller/api/common/links"
                require "dockmaster/models/client"
                require "dockmaster/models/clientGroup"
                
                def self.registered(app)
                    
                    app.post "/clientGroups" do
                        
                        # TODO
                        
                    end
                    
                    app.get "/clientGroups" do
                        
                        # TODO
                        
                    end
                    
                    app.get "/clientGroups/:groupId" do
                        
                        # TODO
                        
                    end
                    
                    app.put "/clientGroups/:groupId" do
                        
                        # TODO
                        
                    end
                    
                    app.delete "/clientGroups/:groupId" do
                        
                        # TODO
                        
                    end
                    
                    app.post "/clientGroups/:groupId/clients" do
                        
                        # TODO
                        
                    end
                    
                    app.delete "/clientGroups/:groupId/clients/:clientId" do
                        
                        # TODO
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

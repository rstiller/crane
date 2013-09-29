
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
                
                def self.registerNewGroup(app)
                    
                    app.post "/clientGroups" do
                        
                        payload = parsePayload
                        
                        group = Dockmaster::Models::ClientGroup.from_hash payload
                        group.save
                        
                        unless payload["clients"].nil?
                            payload["clients"].each do |clientId|
                                group.add_client Dockmaster::Models::Client[clientId]
                            end
                        end
                        
                        group = group.to_hash["values"]
                        
                        linkify group,
                            {"path" => request.path, "rel" => "all"},
                            {"path" => "#{request.path}/#{group[:id]}", "rel" => "self"},
                            {"path" => "#{request.path}/#{group[:id]}", "rel" => "delete", "method" => "delete"},
                            {"path" => "#{request.path}/#{group[:id]}", "rel" => "update", "method" => "put"}
                        
                        render group, 201
                        
                    end
                    
                end
                
                def self.registerGetGroups(app)
                    
                    app.get "/clientGroups" do
                        
                        groups = []
                        Dockmaster::Models::ClientGroup.all.each do |group|
                            
                            clients = group.clients
                            
                            groupHash = group.to_hash["values"]
                            groupHash["clients"] = []
                            
                            clients.each do |client|
                                
                                clientHash = client.to_hash["values"]
                                path = request.path.gsub("/clientGroups", "/clients")
                                linkify client,
                                    {"path" => path, "rel" => "self"},
                                    {"path" => path, "rel" => "delete", "method" => "delete"},
                                    {"path" => path, "rel" => "update", "method" => "put"}
                                
                                groupHash["clients"].push clientHash
                                
                            end
                            
                            groups.push groupHash
                            
                        end
                        
                        list = Controller::List.new groups
                        
                        linkify list,
                            {"path" => request.path, "rel" => "self"},
                            {"path" => request.path, "rel" => "new", "method" => "post"},
                            {"path" => request.path + "/{id}", "rel" => "delete", "method" => "delete", "templated" => true},
                            {"path" => request.path + "/{id}", "rel" => "update", "method" => "put", "templated" => true},
                            {"path" => request.path + "/{id}", "rel" => "single", "method" => "get", "templated" => true}
                        
                        render list
                        
                    end
                    
                end
                
                def self.registerGetGroup(app)
                    
                    app.get "/clientGroups/:groupId" do
                        
                        groups = Dockmaster::Models::ClientGroup.where :id => params[:groupId]
                        group = groups.first
                        
                        if group.nil?
                            
                            halt 404
                            
                        end
                        
                        clients = group.clients
                        
                        groupHash = group.to_hash["values"]
                        groupHash["clients"] = []
                        
                        clients.each do |client|
                            
                            clientHash = client.to_hash["values"]
                            path = request.path.gsub("/clientGroups", "/clients")
                            linkify client,
                                {"path" => path, "rel" => "self"},
                                {"path" => path, "rel" => "delete", "method" => "delete"},
                                {"path" => path, "rel" => "update", "method" => "put"}
                            
                            groupHash["clients"].push clientHash
                            
                        end
                        
                        linkify groupHash,
                            {"path" => request.path, "rel" => "self"},
                            {"path" => request.path, "rel" => "delete", "method" => "delete"},
                            {"path" => request.path, "rel" => "update", "method" => "put"}
                        
                        render groupHash
                        
                    end
                    
                end
                
                def self.registerUpdateGroup(app)
                    
                    app.put "/clientGroups/:groupId" do
                        
                        groups = Dockmaster::Models::ClientGroup.where :id => params[:groupId]
                        group = groups.first
                        
                        if group.nil?
                            
                            halt 404
                            
                        end
                        
                        payload = parsePayload
                        
                        unless payload["name"].nil?
                            group.name = payload["name"]
                        end
                        
                        unless payload["description"].nil?
                            group.description = payload["description"]
                        end
                        
                        group.save
                        groupHash = group.to_hash["values"]
                        groupHash["clients"] = []
                        
                        clients.each do |client|
                            
                            clientHash = client.to_hash["values"]
                            path = request.path.gsub("/clientGroups", "/clients")
                            linkify client,
                                {"path" => path, "rel" => "self"},
                                {"path" => path, "rel" => "delete", "method" => "delete"},
                                {"path" => path, "rel" => "update", "method" => "put"}
                            
                            groupHash["clients"].push clientHash
                            
                        end
                        
                        linkify groupHash,
                            {"path" => request.path, "rel" => "self"},
                            {"path" => request.path, "rel" => "delete", "method" => "delete"},
                            {"path" => request.path, "rel" => "update", "method" => "put"}
                        
                        render groupHash
                        
                    end
                    
                end
                
                def self.registerDeleteGroup(app)
                    
                    app.delete "/clientGroups/:groupId" do
                        
                        groups = Dockmaster::Models::ClientGroup.where :id => params[:groupId]
                        group = groups.first
                        
                        if group.nil?
                            
                            halt 404
                            
                        end
                        
                        group.delete
                        
                        status 204
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
                def self.registerAddClient(app)
                    
                    app.post "/clientGroups/:groupId/clients/:clientId" do
                        
                        groups = Dockmaster::Models::ClientGroup.where :id => params[:groupId]
                        group = groups.first
                        
                        if group.nil?
                            
                            halt 404
                            
                        end
                        
                        clients = Dockmaster::Models::Client.where :id => params[:clientId]
                        client = clients.first
                        
                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        group.add_client client
                        
                        status 201
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
                def self.registerRemoveClient(app)
                    
                    app.delete "/clientGroups/:groupId/clients/:clientId" do
                        
                        groups = Dockmaster::Models::ClientGroup.where :id => params[:groupId]
                        group = groups.first
                        
                        if group.nil?
                            
                            halt 404
                            
                        end
                        
                        clients = Dockmaster::Models::Client.where :id => params[:clientId]
                        client = clients.first
                        
                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        group.remove_client client
                        
                        status 200
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    registerNewGroup app
                    registerGetGroups app
                    registerGetGroup app
                    registerUpdateGroup app
                    registerDeleteGroup app
                    registerAddClient app
                    registerRemoveClient app
                    
                end
                
            end
            
        end
        
    end

end

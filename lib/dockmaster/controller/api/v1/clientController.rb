
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module ClientController
                
                require "dockmaster/controller/api/common/list"
                require "dockmaster/controller/api/common/link"
                require "dockmaster/controller/api/common/links"
                require "dockmaster/models/client"
                
                def self.registerNewClient(app)
                    
                    app.post "/clients" do
                        
                        payload = parsePayload
                        
                        client = Dockmaster::Models::Client.from_hash payload
                        client.save
                        client = client.to_hash["values"]
                        
                        linkifyNew client, request.path
                        
                        render client, 201
                        
                    end
                    
                end
                
                def self.registerGetClients(app)
                    
                    app.get "/clients" do
                        
                        clients = []
                        Dockmaster::Models::Client.all.each do |client|
                            clients.push client.to_hash["values"]
                        end
                        
                        list = Controller::List.new clients
                        
                        linkifyGetAll list, request.path
                        
                        render list
                        
                    end
                    
                end
                
                def self.registerGetClient(app)
                    
                    app.get "/clients/:id" do
                        
                        clients = Dockmaster::Models::Client.where :id => params[:id]
                        client = clients.first
                        
                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        client = client.to_hash["values"]
                        
                        linkifyGet client, request.path
                        
                        render client
                        
                    end
                    
                end
                
                def self.registerUpdateClient(app)

                    app.put "/clients/:id" do
                        
                        clients = Dockmaster::Models::Client.where :id => params[:id]
                        client = clients.first
                        
                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        payload = parsePayload
                        
                        unless payload["address"].nil?
                            client.address = payload["address"]
                        end
                        
                        unless payload["dockerVersion"].nil?
                            client.dockerVersion = payload["dockerVersion"]
                        end
                        
                        unless payload["dockerPort"].nil?
                            client.dockerPort = payload["dockerPort"]
                        end
                        
                        client.save
                        client = client.to_hash["values"]
                        
                        linkifyGet client, request.path
                        
                        render client
                        
                    end
                    
                end
                
                def self.registerDeleteClient(app)

                    app.delete "/clients/:id" do
                        
                        clients = Dockmaster::Models::Client.where :id => params[:id]
                        client = clients.first
                        
                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        client.delete
                        
                        status 204
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    registerNewClient app
                    registerGetClients app
                    registerGetClient app
                    registerUpdateClient app
                    registerDeleteClient app
                    
                end
                
            end
            
        end
        
    end

end

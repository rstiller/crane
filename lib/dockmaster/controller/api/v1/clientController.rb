
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module ClientController
                
                require "dockmaster/controller/api/common/list"
                require "dockmaster/controller/api/common/link"
                require "dockmaster/controller/api/common/links"
                require "dockmaster/models/client"
                
                def self.registered(app)
                    
                    app.post "/clients" do
                        
                        payload = parsePayload
                        
                        client = Dockmaster::Models::Client.from_hash payload
                        client.save
                        client = client.to_hash["values"]
                        
                        links = Controller::Links.new client
                        
                        Controller::Link.new links, "#{request.path}/#{client[:id]}", "delete", "delete"
                        Controller::Link.new links, "#{request.path}/#{client[:id]}", "update", "put"
                        Controller::Link.new links, "#{request.path}/#{client[:id]}", "self"
                        Controller::Link.new links, request.path, "all"
                        
                        status 201
                        render client
                        
                    end
                    
                    app.get "/clients" do
                        
                        clients = []
                        Dockmaster::Models::Client.all.each do |client|
                            clients.push client.to_hash["values"]
                        end
                        
                        list = Controller::List.new clients
                        links = Controller::Links.new list
                        
                        # Web Linking: http://tools.ietf.org/html/rfc5988
                        # URI Templates: http://tools.ietf.org/html/rfc6570
                        Controller::Link.new links, request.path, "self"
                        Controller::Link.new links, request.path, "new", "post"
                        Controller::Link.new links, request.path + "/{id}", "delete", "delete", true
                        Controller::Link.new links, request.path + "/{id}", "update", "put", true
                        Controller::Link.new links, request.path + "/{id}", "single", "get", true
                        
                        render list
                        
                    end
                    
                    app.get "/clients/:id" do
                        
                        clients = Dockmaster::Models::Client.where :id => params[:id]
                        client = clients.first
                        
                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        client = client.to_hash["values"]
                        
                        links = Controller::Links.new client
                        
                        Controller::Link.new links, request.path, "self"
                        Controller::Link.new links, request.path, "delete", "delete"
                        Controller::Link.new links, request.path, "update", "put"
                        
                        render client
                        
                    end
                    
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
                        
                        links = Controller::Links.new client
                        
                        Controller::Link.new links, request.path, "self"
                        Controller::Link.new links, request.path, "delete", "delete"
                        Controller::Link.new links, request.path, "update", "put"
                        
                        render client
                        
                    end
                    
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
                
            end
            
        end
        
    end

end

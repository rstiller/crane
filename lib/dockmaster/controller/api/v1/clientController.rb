
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
                        
                        # TODO
                        puts payload
                        
                        status 204
                        ""
                        
                    end
                    
                    app.get "/clients" do
                        
                        clients = Dockmaster::Models::Client.all
                        
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
                        
                        client = client.to_hash
                        
                        links = Controller::Links.new client
                        
                        Controller::Link.new links, request.path, "self"
                        Controller::Link.new links, request.path, "delete", "delete", true
                        Controller::Link.new links, request.path, "update", "put", true
                        
                        render client
                        
                    end
                    
                    app.put "/clients/:id" do
                        
                        # TODO
                        
                    end
                    
                    app.delete "/clients/:id" do
                        
                        # TODO
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

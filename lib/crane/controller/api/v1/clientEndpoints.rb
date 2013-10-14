
require "sequel"

module Crane
    
    module Controller
        
        module V1
            
            module ClientEndpoints
                
                require "crane/models/client"
                
                def self.getClient(id)
                    
                    clients = Crane::Models::Client.where :id => id
                    clients.first
                    
                end
                
                def imagesEndpoint(app, route)
                    
                    app.get route do
                        
                        client = Crane::Controller::V1::ClientEndpoints::getClient params[:id]
                        
                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        render client.images
                        
                    end
                    
                end
                
                def containersEndpoint(app, route)
                    
                    app.get route do

                        client = Crane::Controller::V1::ClientEndpoints::getClient params[:id]

                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        render client.containers
                        
                    end
                    
                end
                
                def infoEndpoint(app, route)
                    
                    app.get route do

                        client = Crane::Controller::V1::ClientEndpoints::getClient params[:id]

                        if client.nil?
                            
                            halt 404
                            
                        end
                        
                        render client.info
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

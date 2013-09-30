
module Dockmaster
    
    module Controller
        
        module DeleteEndpoint
            
            def deleteEndpoint(app, route, model)
                
                app.delete route do
                    
                    objects = model.where :id => params[:id]
                    object = objects.first
                    
                    if object.nil?
                        
                        halt 404
                        
                    end
                    
                    object.delete
                    
                    status 204
                    headers "Content-Length" => "0"
                    body ""
                    
                end
                
            end
            
        end
        
    end

end

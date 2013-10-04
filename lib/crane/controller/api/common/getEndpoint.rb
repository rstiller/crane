
module Crane
    
    module Controller
        
        module GetEndpoint
            
            def getEndpoint(app, route, model, &block)
                
                app.get route do
                    
                    objects = model.where :id => params[:id]
                    object = objects.first
                    
                    if object.nil?
                        
                        halt 404
                        
                    end
                    
                    if block_given?
                        
                        object = self.instance_exec object, &block
                        
                    else
                        
                        object = object.to_hash["values"]
                        
                    end
                    
                    linkifyGet object, request.path
                    
                    render object
                    
                end
                
            end
            
        end
        
    end

end

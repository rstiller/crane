
module Crane
    
    module Controller
        
        module NewEndpoint
            
            def newEndpoint(app, route, model, &block)
                
                app.post route do
                    
                    payload = parsePayload
                    
                    object = model.from_hash payload
                    object.save
                    
                    if block_given?
                        
                        object = self.instance_exec object, payload, &block
                        
                    else
                        
                        object = object.to_hash["values"]
                        
                    end
                    
                    linkifyNew object, request.path
                    
                    render object, 201
                    
                end
                
            end
            
        end
        
    end

end

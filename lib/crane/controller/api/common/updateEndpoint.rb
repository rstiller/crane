
module Crane
    
    module Controller
        
        module UpdateEndpoint
            
            def updateEndpoint(app, route, model, fields, &block)
                
                app.put route do
                    
                    objects = model.where :id => params[:id]
                    object = objects.first
                    
                    if object.nil?
                        
                        halt 404
                        
                    end
                    
                    payload = parsePayload
                    
                    unless fields.nil?
                        
                        fields.each do |field|
                            
                            unless payload[field].nil?
                                
                                object[field] = payload[field]
                                
                            end
                            
                        end
                        
                    end
                    
                    object.save
                    
                    if block_given?
                        
                        object = self.instance_exec object, payload, &block
                        
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

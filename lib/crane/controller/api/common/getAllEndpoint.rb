
module Crane
    
    module Controller
        
        module GetAllEndpoint
            
            def getAllEndpoint(app, route, model, &block)
                
                app.get route do
                    
                    objects = []
                    model.all.each do |object|
                        
                        if block_given?
                            
                            objects.push self.instance_exec(object, &block)
                            
                        else
                            
                            objectHash = object.to_hash["values"]
                            linkifyGet objectHash, "#{request.path}/#{object.id}"
                            objects.push objectHash
                            
                        end
                        
                    end
                    
                    list = Controller::List.new objects
                    
                    linkifyGetAll list, request.path
                    
                    render list
                    
                end
                
            end
            
        end
        
    end

end

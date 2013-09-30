
module Dockmaster
    
    module Controller
        
        module GetAllEndpoint
            
            def getAllEndpoint(app, route, model, &block)
                
                app.get route do
                    
                    objects = []
                    model.all.each do |object|
                        
                        if block_given?
                            
                            objects.push self.instance_exec(object, &block)
                            
                        else
                            
                            objects.push object.to_hash["values"]
                            
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

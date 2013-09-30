
module Dockmaster
    
    module Controller
        
        module RelationEndpoint
            
            def relationEndpoint(app, route, parentModel, childModel, childModelName, add)
                
                app.post route do
                    
                    parents = parentModel.where :id => params[:parentId]
                    parent = parents.first
                    
                    if parent.nil?
                        
                        halt 404
                        
                    end
                    
                    children = childModel.where :id => params[:childId]
                    child = children.first
                    
                    if child.nil?
                        
                        halt 404
                        
                    end
                    
                    if add == true
                        
                        parent.send :"add_#{childModelName}", child
                        status 201
                        
                    else
                        
                        parent.send :"remove_#{childModelName}", child
                        status 204
                        
                    end
                    
                    headers "Content-Length" => "0"
                    body ""
                    
                end
                
            end
            
        end
        
    end

end

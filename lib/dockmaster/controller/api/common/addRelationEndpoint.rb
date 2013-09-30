
module Dockmaster
    
    module Controller
        
        module AddRelationEndpoint
            
            def addRelationEndpoint(app, route, parentModel, childModel, childModelName)
                
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
                    
                    parent.send :"add_#{childModelName}", child
                    
                    status 201
                    headers "Content-Length" => "0"
                    body ""
                    
                end
                
            end
            
        end
        
    end

end


module Dockmaster
    
    module Controller
        
        module DeleteRelationEndpoint
            
            def deleteRelationEndpoint(app, route, parentModel, childModel, childModelName)
                
                app.delete route do
                    
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
                    
                    parent.send :"remove_#{childModelName}", child
                    
                    status 200
                    headers "Content-Length" => "0"
                    body ""
                    
                end
                
            end
            
        end
        
    end

end

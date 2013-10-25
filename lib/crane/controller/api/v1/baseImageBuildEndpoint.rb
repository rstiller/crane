
module Crane
    
    module Controller
        
        module V1
            
            module BaseImageBuildEndpoint
                
                def buildBaseImage(app, route)
                    
                    app.put route do
                        
                        images = Crane::Models::BaseImage.where :id => params[:id]
                        image = images.first
                        
                        if image.nil?
                            halt 404
                        end
                        
                        image.buildImage
                        
                        halt 204, ""
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

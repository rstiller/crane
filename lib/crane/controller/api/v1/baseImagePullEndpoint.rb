
module Crane
    
    module Controller
        
        module V1
            
            module BaseImagePullEndpoint
                
                def pullBaseImage(app, route)
                    
                    app.post route do
                        
                        baseImageName = params[:splat]
                        
                        images = Crane::Models::BaseImage.where :name => baseImageName
                        
                        if images.count <= 0
                            
                            baseImage = Crane::Models::BaseImage.new
                            baseImage.name = baseImageName
                            baseImage.type = Crane::Models::BaseImage::TYPE_STANDARD
                            baseImage.version = ""
                            baseImage.save
                            
                        end
                        
                        Open3.popen3 "docker pull #{baseImageName}"
                        
                        halt 204, ""
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

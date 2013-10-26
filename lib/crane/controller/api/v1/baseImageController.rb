
module Crane
    
    module Controller
        
        module V1
            
            module BaseImageController
                
                require "crane/controller/api/common/deleteEndpoint"
                require "crane/controller/api/common/getAllEndpoint"
                require "crane/controller/api/common/getEndpoint"
                require "crane/controller/api/common/newEndpoint"
                require "crane/controller/api/common/updateEndpoint"
                require "crane/controller/api/v1/baseImageBuildEndpoint"
                require "crane/controller/api/v1/baseImagePullEndpoint"
                require "crane/models/baseImage"
                require "crane/models/package"
                
                extend Controller::DeleteEndpoint
                extend Controller::GetAllEndpoint
                extend Controller::GetEndpoint
                extend Controller::NewEndpoint
                extend Controller::UpdateEndpoint
                extend Controller::V1::BaseImageBuildEndpoint
                extend Controller::V1::BaseImagePullEndpoint
                
                module Helper
                    
                    def linkifyBaseImage(hash, path)
                        
                        linkify hash,
                            {"path" => path, "rel" => "self"},
                            {"path" => path, "rel" => "delete", "method" => "delete"},
                            {"path" => path, "rel" => "update", "method" => "put"},
                            {"path" => "#{path}/build", "rel" => "build", "method" => "put"}
                        
                    end
                    
                    def renderBaseImage(image)
                        
                        packages = image.package
                        
                        imageHash = image.to_hash["values"]
                        imageHash["tags"] = image.info
                        imageHash["packages"] = []
                        
                        packages.each do |package|
                            
                            imageHash["packages"].push package.to_hash["values"]
                            
                        end
                        
                        linkifyBaseImage imageHash, "#{request.path}/#{image.id}"
                        
                        imageHash
                        
                    end
                    
                    def updatePackages(image, packages)
                        
                        unless packages.nil?
                            
                            packages.each do |pkg|
                                
                                package = Crane::Models::Package.from_hash pkg
                                image.add_package package
                                
                            end
                            
                        end
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    newEndpoint app, "/baseImages", Crane::Models::BaseImage do |image, payload|
                        
                        updatePackages image, payload["packages"]
                        renderBaseImage image
                        
                    end
                    
                    getAllEndpoint app, "/baseImages", Crane::Models::BaseImage do |image|
                        
                        renderBaseImage image
                        
                    end
                    
                    getEndpoint app, "/baseImages/:id", Crane::Models::BaseImage do |image|
                        
                        renderBaseImage image
                        
                    end
                    
                    deleteEndpoint app, "/baseImages/:id", Crane::Models::BaseImage
                    
                    buildBaseImage app, "/baseImages/:id/build"
                    
                    pullBaseImage app, "/baseImages/pull"
                    
                    updateEndpoint app, "/baseImages/:id", Crane::Models::BaseImage, [ "name", "version", "baseImage", "provision", "provisionVersion" ] do |image, payload|
                        
                        image.remove_all_package
                        updatePackages image, payload["packages"]
                        renderBaseImage image
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

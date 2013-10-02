
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module BaseImageController
                
                require "dockmaster/controller/api/common/deleteEndpoint"
                require "dockmaster/controller/api/common/getAllEndpoint"
                require "dockmaster/controller/api/common/getEndpoint"
                require "dockmaster/controller/api/common/newEndpoint"
                require "dockmaster/controller/api/common/updateEndpoint"
                require "dockmaster/models/baseImage"
                require "dockmaster/models/package"
                
                extend Controller::DeleteEndpoint
                extend Controller::GetAllEndpoint
                extend Controller::GetEndpoint
                extend Controller::NewEndpoint
                extend Controller::UpdateEndpoint
                
                module Helper
                    
                    def renderBaseImage(image)
                        
                        packages = image.package
                        
                        imageHash = image.to_hash["values"]
                        imageHash["packages"] = []
                        
                        packages.each do |package|
                            
                            imageHash["packages"].push package.to_hash["values"]
                            
                        end
                        
                        imageHash
                        
                    end
                    
                    def updatePackages(image, packages)
                        
                        unless packages.nil?
                            
                            packages.each do |pkg|
                                
                                package = Dockmaster::Models::Package.from_hash pkg
                                image.add_package package
                                
                            end
                            
                        end
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    newEndpoint app, "/baseImages", Dockmaster::Models::BaseImage do |image, payload|
                        
                        updatePackages image, payload["packages"]
                        renderBaseImage image
                        
                    end
                    
                    getAllEndpoint app, "/baseImages", Dockmaster::Models::BaseImage do |image|
                        
                        renderBaseImage image
                        
                    end
                    
                    getEndpoint app, "/baseImages/:id", Dockmaster::Models::BaseImage do |image|
                        
                        renderBaseImage image
                        
                    end
                    
                    deleteEndpoint app, "/baseImages/:id", Dockmaster::Models::BaseImage
                    
                    updateEndpoint app, "/baseImages/:id", Dockmaster::Models::BaseImage, [ "name", "version", "baseImage", "provision", "provisionVersion" ] do |image, payload|
                        
                        image.remove_all_package
                        updatePackages image, payload["packages"]
                        renderBaseImage image
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end


module Dockmaster
    
    module Controller
        
        module V1
            
            module RunConfigEndpoint
                
                def addRunConfig(app, route)
                    
                    app.post route do
                        
                        workingCopies = Dockmaster::Models::WorkingCopy::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        payload = parsePayload
                        runConfig = Dockmaster::Models::RunConfig.from_hash payload
                        
                        workingCopy.add_runConfig runConfig
                        
                        status 201
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
                def removeRunConfig(app, route)
                    
                    app.delete route do
                        
                        workingCopies = Dockmaster::Models::WorkingCopy::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        runConfigs = Dockmaster::Models::RunConfig::where :id => params[:runConfigId]
                        runConfig = runConfigs.first
                        
                        if runConfig.nil?
                            halt 404
                        end
                        
                        workingCopy.remove_runConfig runConfig
                        
                        status 204
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

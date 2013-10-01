
module Dockmaster
    
    module Controller
        
        module V1
            
            module RunConfigEndpoint
                
                def addRunConfig(app, route)
                    
                    app.post route do
                        
                        workingCopies = Controller::Models::WorkingCopy::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        payload = parsePayload
                        runConfig = Controller::Models::RunConfig.from_hash payload
                        
                        workingCopy.add_runConfig runConfig
                        
                    end
                    
                end
                
                def removeRunConfig(app, route)
                    
                    app.delete route do
                        
                        workingCopies = Controller::Models::WorkingCopy::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        runConfigs = Controller::Models::RunConfig::where :id => params[:runConfigId]
                        runConfig = runConfigs.first
                        
                        if runConfig.nil?
                            halt 404
                        end
                        
                        workingCopy.remove_runConfig runConfig
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

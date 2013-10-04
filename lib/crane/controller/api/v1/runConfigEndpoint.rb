
require "sequel"

module Crane
    
    module Controller
        
        module V1
            
            module RunConfigEndpoint
                
                def addRunConfig(app, route)
                    
                    app.post route do
                        
                        projects = Crane::Models::Project::where :id => params[:projectId]
                        project = projects.first
                        
                        if project.nil?
                            halt 404
                        end
                        
                        workingCopies = project.workingCopy_dataset::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        payload = parsePayload
                        runConfig = Crane::Models::RunConfig.from_hash payload
                        
                        begin 
                            
                            workingCopy.add_runConfig runConfig
                            status 201
                            
                        rescue Sequel::DatabaseError => exception
                            
                            status 409
                            
                            unless exception.message.match /^SQLite3::ConstraintException.*/
                                status 500
                            end
                            
                        end
                        
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
                def removeRunConfig(app, route)
                    
                    app.delete route do
                        
                        projects = Crane::Models::Project::where :id => params[:projectId]
                        project = projects.first
                        
                        if project.nil?
                            halt 404
                        end
                        
                        workingCopies = project.workingCopy_dataset::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        runConfigs = workingCopy.runConfig_dataset.where :environment => params[:environment], :serviceName => params[:serviceName]
                        runConfig = runConfigs.first
                        
                        if runConfig.nil?
                            halt 404
                        end
                        
                        workingCopy.runConfig_dataset.where(:environment => params[:environment], :serviceName => params[:serviceName]).delete
                        
                        status 204
                        headers "Content-Length" => "0"
                        body ""
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

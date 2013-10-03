
module Dockmaster
    
    module Controller
        
        module V1
            
            module BuildEndpoint
                
                def triggerBuild(app, route)
                    
                    app.get route do
                        
                        projects = Dockmaster::Models::Project::where :id => params[:projectId]
                        project = projects.first
                        
                        if project.nil?
                            halt 404
                        end
                        
                        workingCopies = project.workingCopy_dataset::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        Dockmaster::Scheduler.buildImage project, workingCopy, workingCopy.ref
                        
                        halt 204, ""
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

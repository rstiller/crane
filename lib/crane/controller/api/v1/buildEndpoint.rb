
module Crane
    
    module Controller
        
        module V1
            
            module BuildEndpoint
                
                def triggerBuild(app, route)
                    
                    app.get route do
                        
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
                        
                        Crane::Scheduler.buildImage project, workingCopy, workingCopy.ref
                        
                        halt 204, ""
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

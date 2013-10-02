
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module V1
            
            module ProjectController
                
                require "dockmaster/controller/api/common/deleteEndpoint"
                require "dockmaster/controller/api/common/getAllEndpoint"
                require "dockmaster/controller/api/common/getEndpoint"
                require "dockmaster/controller/api/common/newEndpoint"
                require "dockmaster/controller/api/common/updateEndpoint"
                require "dockmaster/controller/api/v1/buildHistoryEndpoint"
                require "dockmaster/controller/api/v1/runConfigEndpoint"
                require "dockmaster/models/project"
                require "dockmaster/models/workingCopy"
                
                extend Controller::DeleteEndpoint
                extend Controller::GetAllEndpoint
                extend Controller::GetEndpoint
                extend Controller::NewEndpoint
                extend Controller::UpdateEndpoint
                extend V1::BuildHistoryEndpoint
                extend V1::RunConfigEndpoint
                
                module Helper
                    
                    def renderWorkingCopy(workingCopy)
                        
                        workingCopyHash = workingCopy.to_hash["values"]
                        workingCopyHash["runConfigs"] = []
                        workingCopyHash["buildHistories"] = []
                        
                        workingCopy.buildHistory.each do |buildHistory|
                            # TODO
                        end
                        
                        workingCopy.runConfig.each do |runConfig|
                            # TODO
                        end
                            
                        workingCopyHash
                        
                    end
                    
                    def renderProject(project)
                        
                        workingCopies = project.workingCopy
                        
                        projectHash = image.to_hash["values"]
                        projectHash["branches"] = []
                        projectHash["tags"] = []
                        
                        workingCopies.each do |workingCopy|
                            
                            if workingCopy.branch?
                                
                                projectHash["branches"].push renderWorkingCopy(workingCopy)
                                
                            else
                                
                                projectHash["tags"].push renderWorkingCopy(workingCopy)
                                
                            end
                            
                        end
                        
                        projectHash
                        
                    end
                    
                end
                
                def self.updateBranches(project, workingCopies)
                    
                    project.workingCopy.each do |workingCopy|
                        
                        if workingCopy.branch?
                            
                            if workingCopies.include? workingCopy.name
                                
                                workingCopies.delete_at workingCopies.index(workingCopy.name)
                                
                            else
                                
                                project.remove_workingCopy workingCopy
                                
                            end
                            
                        end
                        
                    end
                    
                    workingCopies.each do |workingCopy|
                        
                        workingCopyObject = Dockmaster::Models::WorkingCopy.new :name => workingCopy, :type => Dockmaster::Models::WorkingCopy::BRANCH
                        project.add_workingCopy workingCopyObject
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    newEndpoint app, "/projects", Dockmaster::Models::Project do |project, payload|
                        
                        updateBranches project, payload["branches"]
                        renderProject project
                        
                    end
                    
                    getAllEndpoint app, "/projects", Dockmaster::Models::Project do |project|
                        
                        renderProject project
                        
                    end
                    
                    getEndpoint app, "/projects/:id", Dockmaster::Models::Project do |project|
                        
                        renderProject project
                        
                    end
                    
                    deleteEndpoint app, "/projects/:id", Dockmaster::Models::Project
                    
                    updateEndpoint app, "/projects/:id", Dockmaster::Models::Project, [ "name", "url", "buildTags" ] do |project, payload|
                        
                        updateBranches project, payload["branches"]
                        renderProject project
                        
                    end
                    
                    addRunConfig app, "/projects/trees/:workingCopyId/configs"
                    removeRunConfig app, "/projects/trees/:workingCopyId/configs/:runConfigId"
                    
                    getBuildHistories app, "/projects/trees/:workingCopyId/histories"
                    getBuildHistory app, "/projects/trees/:workingCopyId/histories/:historyId"
                    
                end
                
            end
            
        end
        
    end

end

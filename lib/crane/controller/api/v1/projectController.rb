
require "sinatra/base"

module Crane
    
    module Controller
        
        module V1
            
            module ProjectController
                
                require "crane/controller/api/common/deleteEndpoint"
                require "crane/controller/api/common/getAllEndpoint"
                require "crane/controller/api/common/getEndpoint"
                require "crane/controller/api/common/newEndpoint"
                require "crane/controller/api/common/updateEndpoint"
                require "crane/controller/api/v1/buildEndpoint"
                require "crane/controller/api/v1/buildHistoryEndpoint"
                require "crane/controller/api/v1/runConfigEndpoint"
                require "crane/models/project"
                require "crane/models/workingCopy"
                
                extend Controller::DeleteEndpoint
                extend Controller::GetAllEndpoint
                extend Controller::GetEndpoint
                extend Controller::NewEndpoint
                extend Controller::UpdateEndpoint
                extend V1::BuildEndpoint
                extend V1::BuildHistoryEndpoint
                extend V1::RunConfigEndpoint
                
                module Helper
                    
                    def linkifyWorkingCopy(workingCopyHash, path)
                        
                        linkify workingCopyHash,
                            {"path" => "#{path}/configs", "rel" => "addConfig", "method" => "post"},
                            {"path" => "#{path}/configs/{environment}/{serviceName}", "rel" => "removeConfig", "method" => "delete", "templated" => true},
                            {"path" => "#{path}/histories", "rel" => "histories"},
                            {"path" => "#{path}/histories/{history}", "rel" => "history", "templated" => true}
                        
                    end
                    
                    def renderWorkingCopy(project, workingCopy)
                        
                        workingCopyHash = workingCopy.to_hash["values"]
                        workingCopyHash["runConfigs"] = []
                        workingCopyHash["buildHistories"] = []
                        
                        workingCopy.buildHistory.each do |buildHistory|
                            
                            workingCopyHash["buildHistories"].push renderBuildHistory(workingCopy, buildHistory, "#{request.path}/trees/#{workingCopy.id}/histories")
                            
                        end
                        
                        workingCopy.runConfig.each do |runConfig|
                            
                            workingCopyHash["runConfigs"].push runConfig.to_hash["values"]
                            
                        end
                        
                        linkifyWorkingCopy workingCopyHash, "#{request.path}/trees/#{workingCopy.id}"
                        
                        workingCopyHash
                        
                    end
                    
                    def renderProject(project)
                        
                        workingCopies = project.workingCopy
                        
                        projectHash = project.to_hash["values"]
                        projectHash["branches"] = []
                        projectHash["tags"] = []
                        
                        workingCopies.each do |workingCopy|
                            
                            if workingCopy.branch?
                                
                                projectHash["branches"].push renderWorkingCopy(project, workingCopy)
                                
                            else
                                
                                projectHash["tags"].push renderWorkingCopy(project, workingCopy)
                                
                            end
                            
                        end
                        
                        linkifyGet projectHash, "#{request.path}/#{project.id}"
                        
                        projectHash
                        
                    end
                    
                    def updateBranches(project, workingCopies)
                        
                        project.workingCopy.each do |workingCopy|
                            
                            if workingCopy.branch?
                                
                                if workingCopies.include? workingCopy.name
                                    
                                    workingCopies.delete_at workingCopies.index(workingCopy.name)
                                    
                                else
                                    
                                    project.remove_workingCopy workingCopy
                                    
                                end
                                
                            end
                            
                        end
                        
                        unless workingCopies.nil?
                            
                            workingCopies.each do |workingCopy|
                                
                                workingCopyObject = Crane::Models::WorkingCopy.new :name => workingCopy, :type => Crane::Models::WorkingCopy::BRANCH
                                project.add_workingCopy workingCopyObject
                                
                            end
                            
                        end
                        
                    end
                    
                end
                
                def self.registered(app)
                    
                    newEndpoint app, "/projects", Crane::Models::Project do |project, payload|
                        
                        updateBranches project, payload["branches"]
                        renderProject project
                        
                    end
                    
                    getAllEndpoint app, "/projects", Crane::Models::Project do |project|
                        
                        renderProject project
                        
                    end
                    
                    getEndpoint app, "/projects/:id", Crane::Models::Project do |project|
                        
                        renderProject project
                        
                    end
                    
                    deleteEndpoint app, "/projects/:id", Crane::Models::Project
                    
                    updateEndpoint app, "/projects/:id", Crane::Models::Project, [ "name", "url", "buildTags" ] do |project, payload|
                        
                        updateBranches project, payload["branches"]
                        renderProject project
                        
                    end
                    
                    addRunConfig app, "/projects/:projectId/trees/:workingCopyId/configs"
                    removeRunConfig app, "/projects/:projectId/trees/:workingCopyId/configs/:environment/:serviceName"
                    
                    getBuildHistories app, "/projects/:projectId/trees/:workingCopyId/histories"
                    getBuildHistory app, "/projects/:projectId/trees/:workingCopyId/histories/:historyId"
                    
                    triggerBuild app, "/projects/:projectId/trees/:workingCopyId/build"
                    
                end
                
            end
            
        end
        
    end

end

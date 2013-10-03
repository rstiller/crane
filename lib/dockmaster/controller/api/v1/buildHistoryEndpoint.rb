
module Dockmaster
    
    module Controller
        
        module V1
            
            module BuildHistoryEndpoint
                
                module Helper
                    
                    def linkifyBuildHistory(historyHash, path)
                        
                        linkify historyHash,
                            {"path" => path, "rel" => "all"},
                            {"path" => "#{path}/#{historyHash[:id]}", "rel" => "self"}
                        
                    end
                    
                    def renderBuildHistory(workingCopy, history, basePath = "")
                        
                        historyHash = history.to_hash["values"]
                        historyHash["output"] = {}
                        
                        history.buildOutput.each do |buildOutput|
                            
                            historyHash["output"][buildOutput.environment] = historyHash["output"][buildOutput.environment] || {}
                            historyHash["output"][buildOutput.environment][buildOutput.serviceName] = { "output" => buildOutput.output }
                            
                        end
                        
                        if basePath.strip.length == 0
                            basePath = "#{request.path}/trees/#{workingCopy.id}/histories"
                        end
                        
                        linkifyBuildHistory historyHash, "#{basePath}"
                        
                        historyHash
                        
                    end
                    
                end
                
                def getBuildHistories(app, route)
                    
                    app.get route do
                        
                        workingCopies = Dockmaster::Models::WorkingCopy::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        objects = []
                        workingCopy.buildHistory.each do |object|
                            
                            if block_given?
                                
                                objects.push self.instance_exec(object, &block)
                                
                            else
                                
                                historyHash = renderBuildHistory(workingCopy, object, request.path)
                                objects.push historyHash
                                
                            end
                            
                        end
                        
                        list = Controller::List.new objects
                        
                        render list
                        
                    end
                    
                end
                
                def getBuildHistory(app, route)
                    
                    app.get route do

                        workingCopies = Dockmaster::Models::WorkingCopy::where :id => params[:workingCopyId]
                        workingCopy = workingCopies.first
                        
                        if workingCopy.nil?
                            halt 404
                        end
                        
                        histories = workingCopy.buildHistory_dataset.where :id => params[:historyId]
                        history = histories.first
                        
                        if history.nil?
                            halt 404
                        end
                        
                        if block_given?
                            
                            history = self.instance_exec history, &block
                            
                        else
                            
                            path = request.path
                            path = path.slice 0, path.rindex("/#{history.id}")
                            history = renderBuildHistory workingCopy, history, path
                            
                        end
                        
                        render history
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

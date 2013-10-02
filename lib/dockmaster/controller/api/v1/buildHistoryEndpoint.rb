
module Dockmaster
    
    module Controller
        
        module V1
            
            module BuildHistoryEndpoint
                
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
                                
                                objects.push object.to_hash["values"]
                                
                            end
                            
                        end
                        
                        list = Controller::List.new objects
                        
                        linkifyGetAll list, request.path
                        
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
                            
                            history = history.to_hash["values"]
                            
                        end
                        
                        linkifyGet history, request.path
                        
                        render history
                        
                    end
                    
                end
                
            end
            
        end
        
    end

end

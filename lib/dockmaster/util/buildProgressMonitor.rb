
module Dockmaster
    
    class BuildProgressMonitor
        
        def initialize(channel, input, output, error, waiter, stepCount)
            
            @step = 0
            @stepCount = stepCount
            @channel = channel
            @output = output
            @error = error
            @updateCallback = nil
            @finishCallback = nil
            @errorCallback = nil
            
            Thread.new {
                
                while !@output.eof?
                    
                    line = @output.gets
                    
                    if line.match /^Step /
                        
                        @step = @step + 1
                        
                        if channel.is_a? String
                            channel.concat line
                        elsif
                            channel.puts line
                        end
                        
                        if !@updateCallback.nil?
                            
                            @updateCallback.call
                            
                        end
                        
                    elsif
                        
                        if channel.is_a? String
                            channel.concat line
                        elsif
                            channel.puts line
                        end
                        
                    end
                    
                end
                
                while !@error.eof?
                    
                    line = @error.gets
                    if channel.is_a? String
                        channel.concat line
                    elsif
                        channel.puts line
                    end
                    
                end
                
                if waiter.value != 0
                    
                    if !@errorCallback.nil?
                        
                        @errorCallback.call
                        
                    end
                    
                elsif
                    
                    if !@finishCallback.nil?
                        
                        @finishCallback.call
                        
                    end
                    
                end
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
            }
            
        end
        
        def stepCount
            @stepCount
        end
        
        def step
            @step
        end
        
        def progress
            ((@step * 1.0) / (@stepCount * 1.0)) * 100.0
        end
        
        def updateCallback= (clb)
            @updateCallback = clb
        end
        
        def errorCallback= (clb)
            @errorCallback = clb
        end
        
        def finishCallback= (clb)
            @finishCallback = clb
        end
        
    end
    
end

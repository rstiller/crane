
module Crane
    
    class BuildProgressMonitor
        
        def initialize(channel, input, output, error, waiter, stepCount, updateCallback, finishCallback, errorCallback)
            
            @step = 0
            @stepCount = stepCount
            @channel = channel
            @output = output
            @error = error
            @updateCallback = updateCallback
            @finishCallback = finishCallback
            @errorCallback = errorCallback
            
            Thread.new {
                
                while !@output.eof?
                    
                    readNextLine channel, @output, true
                    
                end
                
                while !@error.eof?
                    
                    readNextLine channel, @error, false
                    
                end
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
                finish waiter
                
            }
            
        end
        
        def finish(waiter)
            
            begin
                if waiter.value.exited?
                    
                    if !@finishCallback.nil?
                        
                        @finishCallback.call
                        
                    end
                    
                else
                    
                    if !@errorCallback.nil?
                        
                        @errorCallback.call
                        
                    end
                    
                end
            rescue => exception
                puts exception
            end
            
        end
        
        def readNextLine(channel, stream, inspect)
            
            line = stream.gets
            
            if inspect == true and line.match /^Step /
                
                @step = @step + 1
                
                if channel.is_a? String
                    channel.concat line
                elsif
                    channel.puts line
                end
                
                if !@updateCallback.nil?
                    
                    @updateCallback.call
                    
                end
                
            else
                
                if channel.is_a? String
                    channel.concat line
                elsif
                    channel.puts line
                end
                
            end
            
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
        
    end
    
end

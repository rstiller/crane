
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
                    
                    readNextLine channel, @output, true
                    
                end
                
                while !@error.eof?
                    
                    readNextLine channel, @error, false
                    
                end
                
                finish waiter
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
            }
            
        end
        
        def finish(waiter)
            
            if waiter.value != 0
                
                if !@errorCallback.nil?
                    
                    @errorCallback.call
                    
                end
                
            elsif
                
                if !@finishCallback.nil?
                    
                    @finishCallback.call
                    
                end
                
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

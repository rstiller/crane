
module Dockmaster
    
    class BuildProgressMonitor
        
        def initialize(channel, input, output, error, stepCount)
            
            @step = 0
            @stepCount = stepCount
            @channel = channel
            @output = output
            @error = error
            @callback = nil
            
            Thread.new {
                
                while !@output.eof?
                    
                    line = @output.gets
                    
                    if line.match /^Step /
                        
                        @step = @step + 1
                        
                        channel.puts line
                        
                        if !@callback.nil?
                            
                            @callback.call
                            
                        end
                        
                    elsif
    
                        channel.puts line
                        
                    end
                    
                end
                
                while !@error.eof?
                    
                    line = @error.gets
                    channel.puts line
                    
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
        
        def callback= (clb)
            @callback = clb
        end
        
    end
    
end

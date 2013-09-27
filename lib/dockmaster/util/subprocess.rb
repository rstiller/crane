
module Dockmaster
    
    def self.subprocess(cmd, folder = ".", finish = nil, update = nil)
        
        input, output, error, waiter = Open3.popen3 cmd, :chdir => folder
        
        Thread.new {
            
            consoleOutput = ""
            consoleError = ""
            
            while !output.eof?
                
                line = output.gets
                
                if !update.nil?
                    update.call line
                end
                
                consoleOutput = consoleOutput + line
                
            end
            
            while !error.eof?
                
                line = error.gets
                
                if !update.nil?
                    update.call line
                end
                
                consoleError = consoleError + line
                
            end
            
            [input, output, error].each do |stream|
                stream.close
            end
            
            finish.call consoleOutput, consoleError, waiter.value
            
        }
        
    end
    
end

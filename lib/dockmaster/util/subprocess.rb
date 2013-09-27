
module Dockmaster
    
    def self.readLines(out, stream, update)
        
        while !stream.eof?
            
            line = stream.gets
            
            if !update.nil?
                update.call line
            end
            
            out = out + line
            
        end
        
    end
    
    def self.subprocess(cmd, folder = ".", finish = nil, update = nil)
        
        input, output, error, waiter = Open3.popen3 cmd, :chdir => folder
        
        Thread.new {
            
            consoleOutput = ""
            consoleError = ""
            
            Dockmaster::readLines consoleOutput, output, update
            Dockmaster::readLines consoleError, error, update
            
            [input, output, error].each do |stream|
                stream.close
            end
            
            finish.call consoleOutput, consoleError, waiter.value
            
        }
        
    end
    
end

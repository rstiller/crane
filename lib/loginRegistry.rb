
require "open3"
require "configliere"

module Dockmaster
    
    def self.loginRegistry(
        callback,
        host = "localhost",
        socket = "unix:///var/run/docker.sock",
        email = Settings['registry.email'],
        user = Settings['registry.user'],
        password = Settings['registry.password'],
        port = Settings['registry.port'])
        
        input, output, error, waiter = Open3.popen3 "docker -H #{socket} login -e='#{email}' -u='#{user}' -p='#{password}' #{host}:#{port}"
        
        Thread.new {
            
            consoleOutput = ""
            consoleError = ""
            
            while !output.eof?
                
                consoleOutput = consoleOutput + output.gets
                
            end
            
            while !error.eof?
                
                consoleError = consoleError + error.gets
                
            end
            
            [input, output, error].each do |stream|
                stream.close
            end
            
            callback.call consoleOutput, consoleError, waiter.value
            
        }
        
    end
    
end

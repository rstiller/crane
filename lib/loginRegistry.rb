
require "open3"
require "configliere"

module Crane
    
    require "crane/util/subprocess"
    
    def self.loginRegistry(
        callback,
        host = "localhost",
        socket = "unix:///var/run/docker.sock",
        email = Settings['registry.email'],
        user = Settings['registry.user'],
        password = Settings['registry.password'],
        port = Settings['registry.port'])
        
        Crane::subprocess "docker -H #{socket} login -e='#{email}' -u='#{user}' -p='#{password}' #{host}:#{port}", ".", callback
        
    end
    
end

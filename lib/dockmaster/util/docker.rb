
require "open3"

module Dockmaster
    
    class Docker
        
        def self.build(file, name, tag)
            
            folder = File.dirname file
            
            Open3.popen3 "docker build -t #{name}:#{tag} .", :chdir => folder
            
        end
        
        def self.pullImage(name)
            
            Open3.popen3 "docker pull #{name}"
            
        end
        
    end
    
end

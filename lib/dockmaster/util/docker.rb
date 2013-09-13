
module Dockmaster
    
    class Docker
        
        def self.build(file, name, tag)
            
            IO.popen("docker build -t #{name}/#{tag} #{file}") do |process|
                
                content = process.gets(nil)
                
            end
            
        end
        
    end
    
end

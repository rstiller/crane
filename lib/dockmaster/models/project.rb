
require "digest/md5"

module Dockmaster
    
    module Models
        
        class Project
            
            @name = ""
            @url = ""
            
            def initialize(name, url)
                @name = name
                @url = url
            end
            
            def name
                @name
            end
            
            def url
                @url
            end
            
            def getFolder()
                Digest::MD5.hexdigest(@name + "-" + @url)
            end
            
        end
        
    end
    
end

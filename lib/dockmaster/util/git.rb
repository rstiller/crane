
require "open3"

module Dockmaster
    
    class Git
        
        def self.remoteWorkingCopies(url, type)
            
            workingCopies = {}
            
            Open3.popen3 "git ls-remote --#{type} #{url}" do |input, output, error, pid|
                
                content = output.read
                
                if !content.nil?
                    
                    content.gsub!(/\r\n?/, "\n")
                    content.each_line do |line|
                        
                        line =~ /([^\t]*)\trefs\/#{type}\/([^\^\n]*)/
                        
                        if !workingCopies[$2]
                            
                            workingCopies[$2] = $1
                            
                        end
                        
                    end
                    
                end
                
            end
            
            workingCopies
            
        end
        
        def self.remoteBranches(url)
            
            Dockmaster::Git.remoteWorkingCopies url, "heads"
            
        end
        
        def self.remoteTags(url)
            
            Dockmaster::Git.remoteWorkingCopies url, "tags"
            
        end
        
        def self.clone(url, folder)
            
            Open3.popen3 "git clone --recursive #{url} #{folder}"
            
        end
        
        def self.fetch(folder)
            
            Open3.popen3 "git fetch", :chdir => folder
            
        end
        
        def self.checkout(ref, folder)
            
            Open3.popen3 "git checkout #{ref}", :chdir => folder
            
        end
        
        def self.pull(ref, folder)
            
            Open3.popen3 "git pull origin #{ref}", :chdir => folder
            
        end
        
    end
    
end


require "open3"

module Dockmaster
    
    class Git
        
        def self.remoteBranches(url)
            
            branches = {}
            
            Open3.popen3 "git ls-remote --heads #{url}" do |input, output, error, pid|
                
                content = output.read
                
                if !content.nil?
                    
                    content.gsub!(/\r\n?/, "\n")
                    content.each_line do |line|
                        
                        line =~ /([^\t]*)\trefs\/heads\/([^\^\n]*)/
                        
                        if !branches[$2]
                            
                            branches[$2] = $1
                            
                        end
                        
                    end
                    
                end
                
            end
            
            branches
            
        end
        
        def self.remoteTags(url)
            
            tags = {}
            
            Open3.popen3 "git ls-remote --tags #{url}" do |input, output, error, pid|
                
                content = output.read
                
                if !content.nil?
                    
                    content.gsub!(/\r\n?/, "\n")
                    content.each_line do |line|
                        
                        line =~ /([^\t]*)\trefs\/tags\/([^\^\n]*)/
                        
                        if !tags[$2]
                            
                        tags[$2] = $1
                            
                        end
                        
                    end
                    
                end
                
            end
            
            tags
            
        end
        
        def self.clone(url, folder)
            
            Open3.popen3 "git clone --recursive #{url}  #{folder}"
            
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

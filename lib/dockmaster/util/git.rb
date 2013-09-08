
module Dockmaster
    
    class Git
        
        def self.remoteBranches(url)
            
            branches = {}
            
            IO.popen("git ls-remote --heads #{url}") { |process|

                # TODO: operation log
                content = process.gets(nil)
                content.gsub!(/\r\n?/, "\n")
                content.each_line do |line|
                    
                    line =~ /([^\t]*)\trefs\/heads\/([^\^\n]*)/
                    
                    if !branches[$2]
                        
                        branches[$2] = $1
                        
                    end
                    
                end
                
            }
            
            return branches
            
        end
        
        def self.remoteTags(url)
            
            tags = {}
            
            IO.popen("git ls-remote --tags #{url}") { |process|

                # TODO: operation log
                content = process.gets(nil)
                content.gsub!(/\r\n?/, "\n")
                content.each_line do |line|
                    
                    line =~ /([^\t]*)\trefs\/tags\/([^\^\n]*)/
                    
                    if !tags[$2]
                        
                        tags[$2] = $1
                        
                    end
                    
                end
                
            }
            
            return tags
            
        end
        
        def self.clone(url, folder)
            
            IO.popen("git clone #{url}  #{folder}") { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
        def self.fetch(folder)
            
            Dir.chdir(folder)
            IO.popen("git fetch") { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
        def self.checkout(ref, folder)
            
            Dir.chdir(folder)
            IO.popen("git checkout #{ref}") { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
        def self.pull(ref, folder)
            
            Dir.chdir(folder)
            IO.popen("git pull origin #{ref}") { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
    end
    
end

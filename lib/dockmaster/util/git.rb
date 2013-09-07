
module Dockmaster
    
    class Git
        
        def remoteBranches(url)
            
            branches = {}
            
            IO.popen("git ls-remote --heads " + url) { |process|

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
        
        def remoteTags(url)
            
            tags = {}
            
            IO.popen("git ls-remote --tags " + url) { |process|

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
        
        def clone(url, folder)
            
            IO.popen("git clone " + url + " " + folder) { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
        def fetch(folder)
            
            Dir.chdir(folder)
            IO.popen("git fetch") { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
        def checkout(ref, folder)
            
            Dir.chdir(folder)
            IO.popen("git checkout " + ref.name) { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
        def pull(ref, folder)
            
            Dir.chdir(folder)
            IO.popen("git pull origin " + ref.name) { |process|
                
                content = process.gets(nil)
                # TODO: operation log
                
            }
            
        end
        
    end
    
end

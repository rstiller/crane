
module Crane
    
    module Controller
        
        class Link < Hash
            
            def initialize(links, href, rel, method = "get", templated = false)
                
                self["href"] = href
                    
                if templated == true
                    self["templated"] = true
                end
                
                unless method.to_s == "get"
                    self["method"] = method
                end
                
                links[rel] = self
                
            end
            
        end
        
    end

end

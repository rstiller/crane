
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module Linker
            
            # Web Linking: http://tools.ietf.org/html/rfc5988
            # URI Templates: http://tools.ietf.org/html/rfc6570
            def linkify(hash, *links)
                
                linkCollection = Controller::Links.new hash
                
                links.each do |link|
                    
                    linkObj = Controller::Link.new linkCollection, link["path"], link["rel"]
                    
                    linkObj["method"]    = link["method"]    if link.has_key? "method"
                    linkObj["templated"] = link["templated"] if link.has_key? "templated"
                    
                end
                
            end
            
        end
        
    end

end

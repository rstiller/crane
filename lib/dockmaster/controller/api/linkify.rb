
require "sinatra/base"

module Dockmaster
    
    module Controller
        
        module Linker
            
            require "dockmaster/controller/api/common/link"
            require "dockmaster/controller/api/common/links"
            require "dockmaster/controller/api/common/list"
            
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
            
            def linkifyGet(hash, path)
                
                linkify hash,
                    {"path" => path, "rel" => "self"},
                    {"path" => path, "rel" => "delete", "method" => "delete"},
                    {"path" => path, "rel" => "update", "method" => "put"}
                
            end
            
            def linkifyNew(hash, path)
                
                linkify hash,
                    {"path" => path, "rel" => "all"},
                    {"path" => "#{path}/#{hash[:id]}", "rel" => "self"},
                    {"path" => "#{path}/#{hash[:id]}", "rel" => "delete", "method" => "delete"},
                    {"path" => "#{path}/#{hash[:id]}", "rel" => "update", "method" => "put"}
                
            end
            
            def linkifyGetAll(hash, path)
                
                linkify hash,
                    {"path" => path, "rel" => "self"},
                    {"path" => path, "rel" => "new", "method" => "post"},
                    {"path" => path + "/{id}", "rel" => "delete", "method" => "delete", "templated" => true},
                    {"path" => path + "/{id}", "rel" => "update", "method" => "put", "templated" => true},
                    {"path" => path + "/{id}", "rel" => "single", "method" => "get", "templated" => true}
                
            end
            
        end
        
    end

end

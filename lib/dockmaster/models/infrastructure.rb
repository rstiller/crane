
require "yaml"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/service"
        
        class Infrastructure
            
            def initialize(file)
                
                @file = file
                raw = YAML.load_file file
                
                Dockmaster.hashToObject self, raw
                
                parseServices
                
            end
            
            def file
                @file
            end
            
            def services
                @services
            end
            
            def parseServices
                
                folderName = File.dirname @file
                
                @services.each do |serviceName, config|
                    
                    hasManifest = config.has_key? "manifest"
                    
                    if hasManifest
                        
                        fileName = config["manifest"]
                        
                    else
                        
                        fileName = "#{folderName}/#{serviceName}.yml"
                        
                    end
                    
                    service = Service.new fileName
                    
                    config.instance_variable_set("@instance", service)
                    config.class.send(:define_method, "instance", proc {
                        config.instance_variable_get("@instance")
                    })
                    config.class.send(:define_method, "instance=", proc { |v|
                        config.instance_variable_set("@instance", v)
                    })
                    
                end
                
            end
            
        end
        
    end
    
end

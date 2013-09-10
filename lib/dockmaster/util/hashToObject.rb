
module Dockmaster
    
    def self.hashToObject(obj, hash)
        
        hash.each do |key, value|
            
            key = key.gsub(/\.|\s|-|\/|\'/, '_').downcase.to_sym
            
            obj.instance_variable_set("@#{key}", value)
            obj.class.send(:define_method, key, proc {
                obj.instance_variable_get("@#{key}")
            })
            obj.class.send(:define_method, "#{key}=", proc { |v|
                obj.instance_variable_set("@#{key}", v)
            })
            
            if value.kind_of? Hash
                Dockmaster.hashToObject obj.instance_variable_get("@#{key}"), value
            end
            
        end
        
    end
    
end

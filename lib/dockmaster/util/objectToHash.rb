
module Dockmaster
    
    def self.objectToHash(obj)
        
        hash = {}
        
        obj.instance_variables.each { |var|
            
            hash[var.to_s.delete("@")] = obj.instance_variable_get var
            
        }
        
        hash
        
    end
    
end

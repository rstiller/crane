
require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.create_table? "run_configs" do
            
            primary_key :serviceName, :environment, :working_copy_id
            foreign_key :working_copy_id, :on_delete => :cascade
            String :serviceName
            String :environment
            String :command
            
        end
        
        class RunConfig < Sequel::Model
            
            many_to_one :workingCopy
            
            def to_hash
                
                Dockmaster::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                RunConfig.new :serviceName => hash["serviceName"],
                    :environment => hash["environment"],
                    :command => hash["command"]
                
            end
            
        end
        
    end
    
end

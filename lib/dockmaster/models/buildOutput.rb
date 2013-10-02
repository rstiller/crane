
require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.create_table? "build_outputs" do
            
            primary_key :id
            foreign_key :build_history_id, :on_delete => :cascade
            unique [:serviceName, :environment, :build_history_id]
            String :serviceName
            String :environment
            String :output, :text => true
            
        end
        
        class BuildOutput < Sequel::Model
            
            many_to_one :buildHistory
            
            def to_hash
                
                Dockmaster::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                BuildHistory.new :serviceName => hash["serviceName"],
                    :environment => hash["environment"],
                    :output => hash["output"]
                
            end
            
        end
        
    end
    
end

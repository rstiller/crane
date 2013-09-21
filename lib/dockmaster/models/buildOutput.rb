
require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.create_table? "build_outputs" do
            
            primary_key :id
            foreign_key :build_history_id
            String :name
            String :output, :text => true
            
        end
        
        class BuildOutput < Sequel::Model
            
            many_to_one :buildHistory
            
        end
        
    end
    
end

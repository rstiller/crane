
require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.create_table? "run_configs" do
            
            primary_key :imageName, :imageVersion
            foreign_key :project_id
            String :imageName
            String :imageVersion
            String :command
            
        end
        
        class RunConfig < Sequel::Model
            
            many_to_one :project
            
        end
        
    end
    
end


require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.create_table? "run_configs" do
            
            primary_key :service, :environment, :workingCopy
            foreign_key :project_id
            String :service
            String :environment
            String :workingCopy
            String :image
            String :command
            
        end
        
        class RunConfig < Sequel::Model
            
            many_to_one :project
            
        end
        
    end
    
end

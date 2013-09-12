
require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.transaction do
            
            Sequel::Model.db.create_table? "build_histories" do
                
                primary_key :id
                foreign_key :working_copy_id
                DateTime :date
                String :ref
                String :output, :text => true
                Integer :successful
                
            end
            
        end
        
        class BuildHistory < Sequel::Model
        end
        
    end
    
end

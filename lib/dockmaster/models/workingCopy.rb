
require "sequel"

module Dockmaster
    
    module Models
        
        class WorkingCopy < Sequel::Model
            
            unless WorkingCopy.db.table_exists? WorkingCopy.table_name
                
                WorkingCopy.db.create_table WorkingCopy.table_name do
                    
                    primary_key :id
                    foreign_key :project_id
                    String :name
                    String :ref
                    String :type
                    
                end
                
            end
            
            many_to_one :project
            
        end
        
    end
    
end


require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.transaction do
            
            Sequel::Model.db.create_table? "packages" do
                
                primary_key :id
                foreign_key :base_image_id
                String :name
                String :version
                
            end
            
        end
        
        class Package < Sequel::Model
            
            many_to_one :baseImage
            
        end
        
    end
    
end


require "sequel"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/clientGroup"
        
        Sequel::Model.db.create_table? "clients" do
            
            primary_key :id
            String :address
            String :dockerVersion
            Integer :dockerPort
            
        end
        
        class Client < Sequel::Model
            
            many_to_many :clientGroup
            
        end
        
    end
    
end

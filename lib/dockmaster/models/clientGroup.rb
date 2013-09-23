
require "sequel"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/client"
        
        Sequel::Model.db.create_table? "client_groups" do
            
            primary_key :id
            String :name
            String :description
            
        end
        
        class ClientGroup < Sequel::Model
            
            many_to_many :clients
            
        end
        
    end
    
end

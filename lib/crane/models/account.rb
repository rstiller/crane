
require "sequel"

module Crane
    
    module Models
        
        Sequel::Model.db.create_table? "accounts" do
            
            primary_key :id
            String :name
            String :provider
            
        end
        
        class Account < Sequel::Model
        end
        
    end
    
end

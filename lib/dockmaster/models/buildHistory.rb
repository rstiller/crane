
require "sequel"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.create_table? "build_histories" do
            
            primary_key :id
            foreign_key :working_copy_id, :on_delete => :cascade
            DateTime :date
            String :ref
            Integer :successful
            
        end
        
        class BuildHistory < Sequel::Model
            
            BUILD_SUCCESSFUL = 1
            BUILD_BROKEN = 0
            
            one_to_many :buildOutput
            many_to_one :workingCopy
            
            def to_hash
                
                Dockmaster::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                BuildHistory.new :ref => hash["ref"],
                    :successful => hash["successful"],
                    :date => hash["date"]
                
            end
            
        end
        
    end
    
end

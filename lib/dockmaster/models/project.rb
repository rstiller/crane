
require "sequel"
require "configliere"

require "dockmaster/util/git"

module Dockmaster
    
    module Models
        
        Dockmaster::tx do
            
            Sequel::Model.db.create_table? "projects" do
                
                primary_key :id
                String :name, :unique => true
                String :url
                
            end
            
        end
        
        class Project < Sequel::Model
            
            one_to_many :workingCopy
            
            def self.forEachProject
                
                Dockmaster::tx do
                    
                    Project.all.each do |project|
                        
                        yield project
                        
                    end
                    
                end
                
            end
            
        end
        
    end
    
end

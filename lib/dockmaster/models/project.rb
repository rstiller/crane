
require "sequel"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/runConfig"
        require "dockmaster/models/workingCopy"
        
        Sequel::Model.db.create_table? "projects" do
            
            primary_key :id
            String :name, :unique => true
            String :url
            Integer :buildTags
            
        end
        
        class Project < Sequel::Model
            
            BUILD_NO_TAGS = 0
            BUILD_TAGS = 1
            
            one_to_many :workingCopy
            one_to_many :runConfig
            
            def buildsTags?
                buildTags == BUILD_TAGS
            end
            
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


require "sequel"
require "httparty"
require "rubygems"
require "json"

module Crane
    
    module Models
        
        Sequel::Model.db.create_table? "run_configs" do
            
            primary_key :serviceName, :environment, :working_copy_id
            foreign_key :working_copy_id, :on_delete => :cascade
            unique [:serviceName, :environment, :working_copy_id]
            String :serviceName
            String :environment
            String :command
            
        end
        
        class RunConfig < Sequel::Model
            
            many_to_one :workingCopy
            
            def to_hash
                
                Crane::objectToHash self
                
            end
            
            def imageId(workingCopy)
                
                response = HTTParty.get("http://localhost:4243/images/json")
                images = JSON.parse response.body
                id = nil
                imageName = workingCopy.getImageName serviceName
                imageVersion = workingCopy.getImageVersion environment
                
                images.each do |image|
                    
                    if imageName == image["Repository"] and imageVersion == image["Tag"]
                        
                        id = image["Id"]
                        break
                        
                    end
                    
                end
                
                id
                
            end
            
            def self.from_hash(hash)
                
                RunConfig.new :serviceName => hash["serviceName"],
                    :environment => hash["environment"],
                    :command => hash["command"]
                
            end
            
        end
        
    end
    
end

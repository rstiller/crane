
require "sequel"
require "open3"
require "configliere"

module Dockmaster
    
    module Models
        
        require "loginRegistry"
        require "dockmaster/models/clientGroup"
        require "dockmaster/util/objectToHash"
        require "dockmaster/util/subprocess"
        
        Sequel::Model.db.create_table? "clients" do
            
            primary_key :id
            String :address
            String :dockerVersion
            Integer :dockerPort
            
        end
        
        class Client < Sequel::Model
            
            many_to_many :clientGroup
            
            def login(host, callback)
                
                Dockmaster::loginRegistry host, "#{address}:#{dockerPort}", callback
                
            end
            
            def deploy(imageName, imageVersion, callback)
                
                run "docker -H #{address}:#{dockerPort} pull #{imageName}:#{imageVersion}", callback
                
            end
            
            def run(command, callback)
                
                Dockmaster::subprocess "docker -H #{address}:#{dockerPort} #{command}", ".", callback
                
            end
            
            def to_hash
                
                Dockmaster::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                Client.new :address => hash["address"], :dockerVersion => hash["dockerVersion"], :dockerPort => hash["dockerPort"]
                
            end
            
        end
        
    end
    
end

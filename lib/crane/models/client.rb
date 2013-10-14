
require "sequel"
require "open3"
require "configliere"
require "httparty"
require "rubygems"
require "json"

module Crane
    
    module Models
        
        require "loginRegistry"
        require "crane/models/clientGroup"
        require "crane/util/objectToHash"
        require "crane/util/subprocess"
        
        Sequel::Model.db.create_table? "clients" do
            
            primary_key :id
            String :address
            String :dockerVersion
            Integer :dockerPort
            
        end
        
        Sequel::Model.db.create_table? "client_groups_clients" do
            
            primary_key :id
            foreign_key :client_group_id, :client_groups, :on_delete => :cascade
            foreign_key :client_id, :clients, :on_delete => :cascade
            
        end
        
        class Client < Sequel::Model
            
            many_to_many :clientGroups
            
            def login(host, callback)
                
                Crane::loginRegistry host, "#{address}:#{dockerPort}", callback
                
            end
            
            def deploy(imageName, imageVersion, callback)
                
                run "docker -H #{address}:#{dockerPort} pull #{imageName}:#{imageVersion}", callback
                
            end
            
            def run(command, callback)
                
                Crane::subprocess "docker -H #{address}:#{dockerPort} #{command}", ".", callback
                
            end
            
            def info
                
                response = HTTParty.get("http://#{address}:#{dockerPort}/info/json")
                JSON.parse response
                
            end
            
            def containers
                
                response = HTTParty.get("http://#{address}:#{dockerPort}/containers/json")
                JSON.parse response
                
            end
            
            def images
                
                response = HTTParty.get("http://#{address}:#{dockerPort}/images/json")
                JSON.parse response
                
            end
            
            def to_hash
                
                Crane::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                Client.new :address => hash["address"], :dockerVersion => hash["dockerVersion"], :dockerPort => hash["dockerPort"]
                
            end
            
        end
        
    end
    
end

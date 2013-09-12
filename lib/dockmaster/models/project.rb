
require "digest/md5"
require "sequel"
require "configliere"

require "dockmaster/util/git"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.transaction do
            
            Sequel::Model.db.create_table? "projects" do
                
                primary_key :id
                String :name, :unique => true
                String :url
                
            end
            
        end
        
        class Project < Sequel::Model
            
            one_to_many :workingCopy
            
            def self.forEachProject
                
                Project.doInTransaction do
                    
                    Project.all.each do |project|
                        
                        yield project
                        
                    end
                    
                end
                
            end
            
            def self.doInTransaction
                
                Sequel::Model.db.transaction do
                    
                    begin
                    
                        yield
                        
                    rescue => exception
                        
                        puts exception, exception.backtrace
                        
                        raise Sequel::Rollback
                        
                    end
                    
                end
                
            end
            
        end
        
    end
    
end

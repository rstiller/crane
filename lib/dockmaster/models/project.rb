
require "digest/md5"
require "sequel"

module Dockmaster
    
    module Models
        
        class Project < Sequel::Model
            
            unless Sequel::Model.db.table_exists? Project.table_name
                
                Sequel::Model.db.create_table Project.table_name do
                    
                    primary_key :id
                    String :name, :unique => true
                    String :url
                    
                end
                
            end
            
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
                        
                    rescue
                        raise Sequel::Rollback
                    end
                    
                end
                
            end
            
            def getFolder()
                Digest::MD5.hexdigest("#{name}-#{url}")
            end
            
        end
        
    end
    
end

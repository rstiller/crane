
require "sequel"

module Dockmaster
    
    module Models
        
        class WorkingCopy < Sequel::Model
            
            unless WorkingCopy.db.table_exists? WorkingCopy.table_name
                
                WorkingCopy.db.create_table WorkingCopy.table_name do
                    
                    primary_key :id
                    foreign_key :project_id
                    String :name
                    String :ref
                    String :type
                    
                end
                
            end
            
            many_to_one :project
            
            def clone
                git = Git.new
                git.clone url, getCheckoutFolder
            end
            
            def checkout
                git = Git.new
                git.checkout name, getCheckoutFolder
            end
            
            def checkoutFolder
                
                path = Settings["paths.repositories"]
                hash = Digest::MD5.hexdigest "#{project.name}-#{project.url}-#{name}"
                File.absolute_path hash, path
                
            end
            
        end
        
    end
    
end

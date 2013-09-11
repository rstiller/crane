
require "sequel"

module Dockmaster
    
    module Models
        
        class WorkingCopy < Sequel::Model
            
            Sequel::Model.db.transaction do
                
                WorkingCopy.db.create_table? WorkingCopy.table_name do
                    
                    primary_key :id
                    foreign_key :project_id
                    String :name
                    String :ref
                    String :type
                    
                end
                
            end
            
            many_to_one :project
            
            def clone
                Git.clone url, checkoutFolder
            end
            
            def checkout
                Git.checkout name, checkoutFolder
            end
            
            def checkoutFolder
                
                path = Settings["paths.repositories"]
                hash = Digest::MD5.hexdigest "#{project.name}-#{project.url}-#{name}"
                File.absolute_path hash, path
                
            end
            
            def infrastructure
                
                infrastructureFile = File.absolute_path "infrastructure.yml", checkoutFolder
                
                if !File.exists? infrastructureFile
                    
                    raise "infrastructure file not found"
                    
                end
                
                Infrastructure.new infrastructureFile
                
            end
            
            def buildImages
                
                infra = infrastructure
                
                infra.environments.each do |environment, variables|
                    
                    infra.services.each do |service|
                        
                        service.generateDockerfile self, environment, variables
                        service.buildImage self, environment
                        
                    end
                    
                end
                
            end
            
        end
        
    end
    
end


require "sequel"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/infrastructure"
        
        Sequel::Model.db.transaction do
            
            Sequel::Model.db.create_table? "working_copies" do
                
                primary_key :id
                foreign_key :project_id
                String :name
                String :ref
                String :type
                
            end
            
        end
        
        class WorkingCopy < Sequel::Model
            
            many_to_one :project
            
            def clone(url)
                Git.clone url, checkoutFolder
            end
            
            def checkout
                Git.checkout :name, checkoutFolder
            end
            
            def checkoutFolder
                
                path = Settings["paths.repositories"]
                hash = Digest::MD5.hexdigest "#{project[:name]}-#{project[:url]}-#{self[:name]}"
                File.absolute_path hash, path
                
            end
            
            def infrastructure
                
                infrastructureFile = File.absolute_path "infrastructure.yml", checkoutFolder
                
                if !File.exists? infrastructureFile
                    
                    raise "infrastructure file not found"
                    
                end
                
                Models::Infrastructure.new infrastructureFile
                
            end
            
            def buildImages(project)
                
                clone project.url
                checkout
                
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

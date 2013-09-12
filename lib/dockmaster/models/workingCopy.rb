
require "sequel"
require "fileutils"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/buildHistory"
        require "dockmaster/models/infrastructure"
        
        Dockmaster::tx do
            
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
            one_to_many :buildHistory
            
            def clone(url)
                Git.clone url, checkoutFolder
            end
            
            def checkout
                Git.checkout name, checkoutFolder
            end
            
            def clearCheckoutFolder
                
                FileUtils.rm_rf checkoutFolder
                
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
                
                Models::Infrastructure.new infrastructureFile
                
            end
            
            def buildImages(project, buildHistory)
                
                clearCheckoutFolder
                clone project.url
                checkout
                
                infra = infrastructure
                
                infra.environments.each do |environment, variables|
                    
                    infra.services.each do |serviceName, service|
                        
                        service.instance.generateDockerfile self, environment, variables
                        service.instance.buildImage self, environment
                        
                    end
                    
                end
                
            end
            
        end
        
    end
    
end


require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/buildHistory"
        require "dockmaster/models/infrastructure"
        require "dockmaster/models/service"
        require "dockmaster/util/docker"
        
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
            
            def clearImageFolder
                
                FileUtils.rm_rf imageFolder
                
            end
            
            def imageFolder
                
                path = Settings["paths.images"]
                hash = Digest::MD5.hexdigest "#{project.name}-#{project.url}-#{name}"
                File.absolute_path hash, path
                
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
                
                clearImageFolder
                
                infra = infrastructure
                
                infra.environments.each do |environment, variables|
                    
                    infra.services.each do |serviceName, serviceConfig|
                        
                        service = Service.new infra, serviceName, serviceConfig
                        
                        dockerfile = service.generateDockerfile self, environment, variables
                        name = "#{project.name}-#{serviceName}"
                        version = "#{environment}-#{name}"
                        
                        Dockmaster::Util::Docker.build dockerfile, name, version
                        
                    end
                    
                end
                
            end
            
        end
        
    end
    
end

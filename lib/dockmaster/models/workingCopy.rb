
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/buildHistory"
        require "dockmaster/models/buildOutput"
        require "dockmaster/models/infrastructure"
        require "dockmaster/models/service"
        require "dockmaster/util/buildProgressMonitor"
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
                
                input, output, error, waiter = Git.clone url, checkoutFolder
                
                output.each {||}
                error.each {||}
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
            end
            
            def checkout
                
                input, output, error, waiter = Git.checkout name, checkoutFolder
                
                output.each {||}
                error.each {||}
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
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
                
                monitors = {}
                    
                buildHistory.successful = Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL
                
                clearCheckoutFolder
                clone project.url
                checkout
                
                clearImageFolder
                
                infra = infrastructure
                
                infra.environments.each do |environment, variables|
                    
                    monitors[environment] = {}
                    
                    infra.services.each do |serviceName, serviceConfig|
                        
                        service = Service.new infra, serviceName, serviceConfig
                        
                        buildOutput = Dockmaster::Models::BuildOutput.new :name => "#{environment}-#{serviceName}"
                        buildHistory.add_buildOutput buildOutput
                        
                        dockerfile = service.generateDockerfile self, environment, variables
                        imageName = "#{project.name}-#{serviceName}"
                        imageVersion = "#{environment}-#{name}"
                        lineCount = File.open(dockerfile).readlines.length
                        
                        input, output, error, waiter = Dockmaster::Docker.build dockerfile, imageName, imageVersion
                        
                        out = ""
                        
                        monitor = Dockmaster::BuildProgressMonitor.new out, input, output, error, waiter, lineCount - 1
                        monitor.errorCallback = proc {
                            buildOutput.output = out
                            buildHistory.successful = Dockmaster::Models::BuildHistory::BUILD_BROKEN
                            buildHistory.save
                            buildOutput.save
                        }
                        monitor.finishCallback = proc {
                            buildOutput.output = out
                            buildHistory.save
                            buildOutput.save
                        }
                        monitors[environment][serviceName] = monitor
                        
                    end
                    
                end
                
                monitors
                
            end
            
        end
        
    end
    
end

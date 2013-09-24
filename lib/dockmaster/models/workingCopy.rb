
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/buildHistory"
        require "dockmaster/models/buildOutput"
        require "dockmaster/models/infrastructure"
        require "dockmaster/models/runConfig"
        require "dockmaster/models/service"
        require "dockmaster/util/buildProgressMonitor"
        
        Sequel::Model.db.create_table? "working_copies" do
            
            primary_key :id
            foreign_key :project_id
            String :name
            String :ref
            String :type
            
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
            
            def computeFolder(path)
                
                hash = Digest::MD5.hexdigest "#{project.name}-#{project.url}-#{name}"
                File.absolute_path hash, path
                
            end
            
            def clearImageFolder
                
                FileUtils.rm_rf imageFolder
                
            end
            
            def imageFolder
                
                computeFolder Settings["paths.images"]
                
            end
            
            def clearCheckoutFolder
                
                FileUtils.rm_rf checkoutFolder
                
            end
            
            def checkoutFolder
                
                computeFolder Settings["paths.repositories"]
                
            end
            
            def infrastructure
                
                infrastructureFile = File.absolute_path "infrastructure.yml", checkoutFolder
                
                if !File.exists? infrastructureFile
                    
                    raise "infrastructure file not found"
                    
                end
                
                Models::Infrastructure.new infrastructureFile
                
            end
            
            def serviceMonitor(input, output, error, waiter, lineCount)
                
                out = ""
                monitor = Dockmaster::BuildProgressMonitor.new out, input, output, error, waiter, lineCount
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
                
                monitor
                
            end
            
            def buildRunCommand(project, environment, serviceName, serviceConfig, imageName, imageVersion)
                
                runConfig = Models::RunConfig.where :service => serviceName,
                    :environment => environment,
                    :workingCopy => name
                
                if runConfig.nil?
                    
                    runConfig = Models::RunConfig.new :service => serviceName,
                        :environment => environment,
                        :workingCopy => name,
                        :image => "#{imageName}:#{imageVersion}",
                        :command => "docker run -d #{imageName}:#{imageVersion} -m=#{serviceConfig.options.memory}"
                    
                    project.add_runConfig runConfig
                    
                else
                    
                    runConfig.image = "#{imageName}:#{imageVersion}"
                    runConfig.command = "docker run -d #{imageName}:#{imageVersion} -m=#{serviceConfig.options.memory}"
                    runConfig.save
                    
                end
                
            end
            
            def buildServiceImage(project, infra, environment, variables, serviceName, serviceConfig, buildHistory)
                
                service = Service.new infra, serviceName, serviceConfig
                
                buildOutput = Dockmaster::Models::BuildOutput.new :name => "#{environment}-#{serviceName}"
                buildHistory.add_buildOutput buildOutput
                
                dockerfile = service.generateDockerfile self, environment, variables
                imageName = "#{project.name}-#{serviceName}"
                imageVersion = "#{environment}-#{name}"
                lineCount = File.open(dockerfile).readlines.length
                
                buildRunCommand project, environment, serviceName, service, imageName, imageVersion
                
                dockerfileFolder = File.dirname dockerfile
                
                input, output, error, waiter = Open3.popen3 "docker build -t #{imageName}:#{imageVersion} .", :chdir => dockerfileFolder
                
                serviceMonitor input, output, error, waiter, lineCount - 1
                
            end
            
            def buildEnvironment(project, infra, environment, variables, buildHistory)
                
                monitors = {}
                
                infra.services.each do |serviceName, serviceConfig|
                    
                    monitors[serviceName] = buildServiceImage project, infra, environment, variables, serviceName, serviceConfig, buildHistory
                    
                end
                
                monitors
                
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
                    
                    monitors[environment] = buildEnvironment project, infra, environment, variables, buildHistory
                    
                end
                
                monitors
                
            end
            
        end
        
    end
    
end

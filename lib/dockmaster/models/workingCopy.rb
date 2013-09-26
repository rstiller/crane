
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"
require "rubygems"
require "json"

module Dockmaster
    
    module Models
        
        require "config"
        require "ipAddresses"
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
            
            def imageRef(imageName, imageVersion)
                
                ref = ""
                
                Open3.popen3 "docker inspect #{imageName}:#{imageVersion}" do |input, output, error, waiter|
                    
                    info = JSON.parse output.read
                    ref = info[0]["ref"]
                    
                end
                
                ref
                
            end
            
            def tagImage(ref, imageName, imageVersion)
                
                addresses = Dockmaster::getEthernetAddresses
                
                addresses.each do |address|
                    
                    Open3.popen3 "docker tag #{ref} #{address}:#{Settings['registry.port']}/#{imageName}:#{imageVersion}" do |input, output, error, waiter|
                    end
                    
                end
                
            end
            
            def publishImage(imageName, imageVersion)
                
                addresses = Dockmaster::getEthernetAddresses
                
                addresses.each do |address|
                    
                    Open3.popen3 "docker push #{address}:#{Settings['registry.port']}/#{imageName} #{imageVersion}" do |input, output, error, waiter|
                    end
                    
                end
                
            end
            
            def serviceMonitor(imageName, imageVersion, input, output, error, waiter, lineCount)
                
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
                    
                    ref = imageRef imageName, imageVersion
                    tagImage ref, imageName, imageVersion
                    publishImage imageName, imageVersion
                    
                }
                
                monitor
                
            end
            
            def buildRunCommand(project, serviceConfig, imageName, imageVersion)
                
                runConfig = Models::RunConfig.where :imageName => imageName, :imageVersion => imageVersion
                runConfig = runConfig.first
                
                if runConfig.nil?
                    
                    runConfig = Models::RunConfig.new :imageName => imageName,
                        :imageVersion => imageVersion,
                        :command => "docker run -d #{imageName}:#{imageVersion} -m=#{serviceConfig.options.memory}"
                    
                    project.add_runConfig runConfig
                    
                else
                    
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
                
                buildRunCommand project, service, imageName, imageVersion
                
                dockerfileFolder = File.dirname dockerfile
                
                input, output, error, waiter = Open3.popen3 "docker build -t #{imageName}:#{imageVersion} .", :chdir => dockerfileFolder
                
                serviceMonitor imageName, imageVersion, input, output, error, waiter, lineCount - 1
                
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

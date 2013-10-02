
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"
require "rubygems"
require "json"

module Dockmaster
    
    module Models
        
        require "loginRegistry"
        require "ipAddresses"
        require "dockmaster/models/buildHistory"
        require "dockmaster/models/buildOutput"
        require "dockmaster/models/infrastructure"
        require "dockmaster/models/runConfig"
        require "dockmaster/models/service"
        require "dockmaster/util/buildProgressMonitor"
        
        Sequel::Model.db.create_table? "working_copies" do
            
            primary_key :id
            foreign_key :project_id, :on_delete => :cascade
            String :name
            String :ref
            String :type
            
        end
        
        class WorkingCopy < Sequel::Model
            
            BRANCH = "branch"
            TAG = "tag"
            
            many_to_one :project
            one_to_many :buildHistory
            one_to_many :runConfig
            
            def branch?
                type == BRANCH
            end
            
            def tag?
                type == TAG
            end
            
            def to_hash
                
                Dockmaster::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                WorkingCopy.new :name => hash["name"],
                    :ref => hash["ref"],
                    :type => hash["type"]
                
            end
            
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
            
            def imageRef(out, imageName, imageVersion)
                
                ref = ""
                
                Open3.popen3 "docker inspect #{imageName}:#{imageVersion}" do |input, output, error, waiter|
                    
                    jsonContent = output.read
                    
                    content = "inspect image for repository #{imageName} - tag #{imageVersion}"
                    content.concat jsonContent
                    content.concat error.read
                    out.concat content
                    
                    if waiter.value.exited?
                        
                        info = JSON.parse jsonContent
                        ref = info[0]["id"]
                        
                    end
                    
                end
                
                ref
                
            end
            
            def logAction(out, heading, output, error)
                content = heading
                content.concat output.read
                content.concat error.read
                out.concat content
            end
            
            def tagImage(out, ref, imageName, imageVersion)
                
                addresses = Dockmaster::getEthernetAddresses
                
                addresses.each do |address|
                    
                    Open3.popen3 "docker tag #{ref} #{address}:#{Settings['registry.port']}/#{imageName} #{imageVersion}" do |input, output, error, waiter|
                        logAction out, "tag image for repository #{imageName} - tag #{imageVersion} - address #{address}", output, error
                    end
                    
                end
                
            end
            
            def publishImage(out, imageName, imageVersion)
                
                addresses = Dockmaster::getEthernetAddresses
                
                Dockmaster::loginRegistry proc { |output, error, returnCode|
                    
                    if returnCode.exited?
                        
                        addresses.each do |address|
                            
                            Open3.popen3 "docker push #{address}:#{Settings['registry.port']}/#{imageName} #{imageVersion}" do |input, output, error, waiter|
                                logAction out, "publish image for repository #{imageName} - tag #{imageVersion} - address #{address}", output, error
                            end
                            
                        end
                        
                    end
                    
                }
                
            end
            
            def serviceMonitor(buildOutput, buildHistory, imageName, imageVersion, input, output, error, waiter, lineCount)
                
                out = ""
                errorCallback = proc {
                    
                    buildOutput.output = out
                    buildHistory.successful = Dockmaster::Models::BuildHistory::BUILD_BROKEN
                    buildHistory.save
                    buildOutput.save
                    
                }
                finishCallback = proc {
                    
                    ref = imageRef out, imageName, imageVersion
                    tagImage out, ref, imageName, imageVersion
                    publishImage out, imageName, imageVersion
                    
                    buildOutput.output = out
                    buildHistory.save
                    buildOutput.save
                    
                }
                
                Dockmaster::BuildProgressMonitor.new out, input, output, error, waiter, lineCount, nil, finishCallback, errorCallback
                
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
            
            def getImageName(serviceName)
                "#{project.name}-#{serviceName}"
            end
            
            def getImageVersion(environment)
                "#{environment}-#{name}"
            end
            
            def buildServiceImage(project, infra, environment, variables, serviceName, serviceConfig, buildHistory)
                
                service = Service.new infra, serviceName, serviceConfig
                
                buildOutput = Dockmaster::Models::BuildOutput.new :environment => environment, :serviceName => serviceName
                buildHistory.add_buildOutput buildOutput
                
                dockerfile = service.generateDockerfile self, environment, variables
                imageName = getImageName serviceName
                imageVersion = getImageVersion environment
                lineCount = File.open(dockerfile).readlines.length
                
                buildRunCommand project, service, imageName, imageVersion
                
                dockerfileFolder = File.dirname dockerfile
                
                input, output, error, waiter = Open3.popen3 "docker build -t #{imageName}:#{imageVersion} .", :chdir => dockerfileFolder
                
                serviceMonitor buildOutput, buildHistory, imageName, imageVersion, input, output, error, waiter, lineCount - 1
                
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

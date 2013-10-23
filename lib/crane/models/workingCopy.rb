
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"
require "rubygems"
require "json"

module Crane
    
    module Models
        
        require "loginRegistry"
        require "ipAddresses"
        require "crane/models/buildHistory"
        require "crane/models/buildOutput"
        require "crane/models/infrastructure"
        require "crane/models/runConfig"
        require "crane/models/service"
        require "crane/util/buildProgressMonitor"
        
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
                
                Crane::objectToHash self
                
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
                
                addresses = Crane::getEthernetAddresses
                
                addresses.each do |address|
                    
                    Open3.popen3 "docker tag #{ref} #{address}:#{Settings['registry.port']}/#{imageName} #{imageVersion}" do |input, output, error, waiter|
                        logAction out, "tag image for repository #{imageName} - tag #{imageVersion} - address #{address}", output, error
                    end
                    
                end
                
            end
            
            def publishImage(out, imageName, imageVersion)
                
                addresses = Crane::getEthernetAddresses
                
                Crane::loginRegistry proc { |output, error, returnCode|
                    
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
                    buildHistory.successful = Crane::Models::BuildHistory::BUILD_BROKEN
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
                
                Crane::BuildProgressMonitor.new out, input, output, error, waiter, lineCount, nil, finishCallback, errorCallback
                
            end
            
            def buildRunCommand(project, serviceConfig, serviceName, environment)
                
                runConfig = runConfig_dataset.where :serviceName => serviceName, :environment => environment
                
                imageName = getImageName serviceName
                imageVersion = getImageVersion environment
                
                if runConfig.count <= 0
                    
                    runConfig = Models::RunConfig.new :serviceName => serviceName,
                        :environment => environment,
                        :command => "docker run -d #{imageName}:#{imageVersion} -m=#{serviceConfig.options.memory}"
                    
                    add_runConfig runConfig
                    
                else
                    
                    runConfig.update :command => "docker run -d #{imageName}:#{imageVersion} -m=#{serviceConfig.options.memory}"
                    
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
                
                buildOutput = Crane::Models::BuildOutput.new :environment => environment, :serviceName => serviceName
                buildHistory.add_buildOutput buildOutput
                
                dockerfile = service.generateDockerfile self, environment, variables
                imageName = getImageName serviceName
                imageVersion = getImageVersion environment
                lineCount = File.open(dockerfile).readlines.length
                
                buildRunCommand project, service, serviceName, environment
                
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
                    
                buildHistory.successful = Crane::Models::BuildHistory::BUILD_SUCCESSFUL
                
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

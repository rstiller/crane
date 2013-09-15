
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"

module Dockmaster
    
    module Models
        
        require "dockmaster/models/package"
        require "dockmaster/util/buildProgressMonitor"
        
        Sequel::Model.db.transaction do
            
            Sequel::Model.db.create_table? "base_images" do
                
                primary_key :id
                DateTime :date
                String :name
                String :version
                String :baseImage
                String :provision
                String :provisionVersion
                
            end
            
        end
        
        class BaseImage < Sequel::Model
            
            one_to_many :package
            
            def generateDockerfile
                
                folder = Digest::MD5.hexdigest "#{name}-#{version}"
                folder = "#{Settings['paths.baseImages']}/#{folder}"
                
                unless File.directory? folder
                    
                    FileUtils.mkdir_p folder
                        
                end
                
                dockerfile = "#{folder}/Dockerfile"
                
                File.open dockerfile, "w:UTF-8" do |file|
                    
                    file.puts "# #{name} (#{version})"
                    file.puts "FROM #{baseImage}"
                    
                    if !package_dataset.empty?
                        
                        file.puts "RUN apt-get update -q"
                        
                        package_dataset.each do |package|
                            
                            packageName = "#{package.name}"
                            
                            if package.version
                                packageName = "#{package.name}=#{package.version}"
                            end
                            
                            file.puts "RUN apt-get install -f -y --force-yes --no-install-recommends #{packageName}"
                            
                        end
                        
                    end
                    
                    if provision == "puppet"
                        
                        puppetversion = "puppet-common puppet"
                        
                        if provisionVersion
                            puppetversion = "puppet-common=#{provisionVersion} puppet=#{provisionVersion}"
                        end
                        
                        file.puts "RUN apt-get install wget -y"
                        file.puts "RUN wget http://apt.puppetlabs.com/puppetlabs-release-`lsb_release -cs`.deb; dpkg -i puppetlabs-release-`lsb_release -cs`.deb"
                        file.puts "RUN apt-get update -q"
                        file.puts "RUN apt-get install -f -y --force-yes --no-install-recommends #{puppetversion}"
                        
                    end
                    
                end
                
                dockerfile
                
            end
            
            def buildImage
                
                dockerfile = generateDockerfile
                Dockmaster::log.info "building baseImage #{name} (#{version}) from #{dockerfile}"
                
                lineCount = File.open(dockerfile).readlines.length
                
                input, output, error, waiter = Dockmaster::Docker.build dockerfile, name, version
                
                out = ""
                
                monitor = Dockmaster::BuildProgressMonitor.new out, input, output, error, waiter, lineCount - 1
                
                return monitor, out
                
            end
            
        end
        
    end
    
end

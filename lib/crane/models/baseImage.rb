
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"

module Crane
    
    module Models
        
        require "crane/models/package"
        require "crane/util/buildProgressMonitor"
        
        Sequel::Model.db.create_table? "base_images" do
            
            primary_key :id
            DateTime :date, :default => Time.now
            String :type, :default => "custom"
            String :name
            String :version
            String :baseImage
            String :provision
            String :provisionVersion
            
        end
        
        class BaseImage < Sequel::Model
            
            TYPE_STANDARD = "standard"
            TYPE_CUSTOM = "custom"
            
            one_to_many :package
            
            def to_hash
                
                Crane::objectToHash self
                
            end
            
            def self.from_hash(hash)
                
                BaseImage.new :name => hash["name"],
                    :type => hash["type"],
                    :version => hash["version"],
                    :baseImage => hash["baseImage"],
                    :provision => hash["provision"],
                    :provisionVersion => hash["provisionVersion"]
                
            end
            
            def getPackageName(package, version)
                
                packageName = package
                
                if version
                    packageName = "#{package}=#{version}"
                end
                
            end
            
            def applyPackages(file)
                
                if !package_dataset.empty?
                    
                    file.puts "RUN apt-get update -q"
                    
                    package_dataset.each do |package|
                        
                        packageName = getPackageName package.name, package.version
                        
                        file.puts "RUN apt-get install -f -y --force-yes --no-install-recommends #{packageName}"
                        
                    end
                    
                end
                
            end
            
            def applyPuppetProvisioning(file)
                
                puppetCommon = getPackageName "puppet-common", provisionVersion
                puppet = getPackageName "puppet", provisionVersion
                
                file.puts "RUN apt-get install wget -y"
                file.puts "RUN wget http://apt.puppetlabs.com/puppetlabs-release-`lsb_release -cs`.deb; dpkg -i puppetlabs-release-`lsb_release -cs`.deb"
                file.puts "RUN apt-get update -q"
                file.puts "RUN apt-get install -f -y --force-yes --no-install-recommends #{puppetCommon} #{puppet}"
                
            end
            
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
                    
                    applyPackages file
                    
                    if provision == "puppet"
                        
                        applyPuppetProvisioning file
                        
                    end
                    
                end
                
                dockerfile
                
            end
            
            def buildImage
                
                dockerfile = generateDockerfile
                Crane::log.info "building baseImage #{name} (#{version}) from #{dockerfile}"
                
                lineCount = File.open(dockerfile).readlines.length
                
                input, output, error, waiter = Crane::Docker.build dockerfile, name, version
                
                out = ""
                
                monitor = Crane::BuildProgressMonitor.new out, input, output, error, waiter, lineCount - 1
                
                return monitor, out
                
            end
            
        end
        
    end
    
end

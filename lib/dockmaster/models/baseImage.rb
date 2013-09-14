
require "digest/md5"
require "sequel"
require "fileutils"
require "configliere"

module Dockmaster
    
    module Models
        
        Sequel::Model.db.transaction do
            
            Sequel::Model.db.create_table? "base_images" do
                
                primary_key :name, :version
                DateTime :date
                String :name
                String :version
                String :baseImage
                String :provision
                String :provisionVersion
                
            end
            
        end
        
        class BaseImage < Sequel::Model
            
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
                
                dockerfile = generateDockerfile#
                Dockmaster::log.info "building baseImage #{name} (#{version}) from #{dockerfile}"
                input, output, error, waiter = Dockmaster::Docker.build dockerfile, name, version
                # TODO: output
                
                puts output.read
                
                [input, output, error].each do |stream|
                    stream.close
                end
                
            end
            
        end
        
    end
    
end

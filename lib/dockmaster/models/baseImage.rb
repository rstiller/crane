
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
                    file.puts "FROM #{base}"
                    
                end
                
                # TODO: provisioner
                
                dockerfile
                
            end
            
        end
        
    end
    
end

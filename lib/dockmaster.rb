#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra"
require "configliere"
require "sequel"
require "fileutils"

# main application module
module Dockmaster
    
    require "dockmaster/util/hashToObject"
    
    Settings.read "./config/defaults.yml"
    Settings.read "/etc/dockmaster/config.yml"
    Settings.resolve!
    
    unless File.directory?(File.dirname(Settings["db.path"]))
        
        FileUtils.mkdir_p(File.dirname(Settings["db.path"]))
            
    end
    
    @database = Sequel.connect("sqlite://" + Settings["db.path"])
    
    require "dockmaster/models/project"
    require "dockmaster/models/infrastructure"
    require "dockmaster/util/scheduler"
    
    class App
        
        infra = Dockmaster::Models::Infrastructure.new "infra.yml"
        
        puts infra.services.mongodb
        
        Dockmaster::Models::Project.doInTransaction do
            
            unless Dockmaster::Models::Project[:name => "jpuppet/java"]
                
                Dockmaster::Models::Project.new do |project|
                    
                    project.name = "jpuppet/java"
                    project.url = "https://github.com/jpuppet/java.git"
                    project.save
                    
                end
                
            else
                
                project = Dockmaster::Models::Project[:name => "jpuppet/java"]
                
            end
            
        end
        
        scheduler = Dockmaster::Scheduler.new
        
    end
    
end

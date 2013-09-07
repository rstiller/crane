#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra"
require "configliere"
require "sequel"
require "fileutils"

# main application module
module Dockmaster
    
    Settings.read "./config/defaults.yml"
    Settings.read "/etc/dockmaster/config.yml"
    Settings.resolve!
    
    unless File.directory?(File.dirname(Settings["db.path"]))
        
        FileUtils.mkdir_p(File.dirname(Settings["db.path"]))
            
    end
    
    @database = Sequel.connect("sqlite://" + Settings["db.path"])
    
    require "dockmaster/models/project"
    require "dockmaster/util/scheduler"
    
    class App
        
        unless Dockmaster::Models::Project[:name => "linux"]
            
            project = Dockmaster::Models::Project.new(:name => "linux", :url => "https://github.com/torvalds/linux.git")
            project.save
            
        end
        
        scheduler = Dockmaster::Scheduler.new
        
    end
    
end

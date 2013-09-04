#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra"
require "configliere"
require "sequel"

require "dockmaster/models/project"
require "dockmaster/util/git"
require "dockmaster/util/scheduler"

# main application module
module Dockmaster
    
    Settings.read "./config/application.yml"
    Settings.read "/etc/dockmaster/config.yml"
    Settings.resolve!
    
    @database = Sequel.sqlite(Settings["db.path"])
    
    class App
        
        project = Dockmaster::Models::Project.new("linux", "https://github.com/torvalds/linux.git")
        
        puts @database.tables
        
    end
    
end

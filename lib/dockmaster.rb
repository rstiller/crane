#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra"
require "configliere"
require "sequel"

require "dockmaster/models/project"
require "dockmaster/util/git"
require "dockmaster/util/scheduler"
require "dockmaster/util/threadpool"

# main application module
module Dockmaster
    
    Settings.read "./config/application.yml"
    Settings.read "/etc/dockmaster/config.yml"
    Settings.resolve!
    
    @database = Sequel.connect("sqlite://test.db")
    
    class App
        
        project = Dockmaster::Models::Project.new("linux", "https://github.com/torvalds/linux.git")
        
        pool = Dockmaster::ThreadPool.new 4
        
        1000.times do |i|
            
            func = Proc.new do |dist, *args|
                
                puts "#{i}"
                
            end
            
            pool.submit func
            
        end
        
    end
    
end

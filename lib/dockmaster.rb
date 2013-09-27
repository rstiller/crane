#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra"

module Dockmaster
    
    require "version"
    require "config"
    require "log"
    require "database"
    require "ipAddresses"
    require "loginRegistry"
    require "dockmaster/util/hashToObject"
    require "dockmaster/util/subprocess"
    
    require "dockmaster/models/baseImage"
    require "dockmaster/models/project"
    require "dockmaster/models/account"
    require "dockmaster/models/client"
    require "dockmaster/models/clientGroup"
    require "dockmaster/util/scheduler"
    
    class App
        
        scheduler = Dockmaster::Scheduler.new
        Dockmaster::log.info "scheduler started"
        
    end
    
end

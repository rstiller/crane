#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra/base"

module Dockmaster
    
    require "version"
    require "config"
    require "log"
    require "database"
    require "dockmaster/util/scheduler"
    
    class App < Sinatra::Base
        
        scheduler = Dockmaster::Scheduler.new
        Dockmaster::log.info "scheduler started"
        
    end
    
end

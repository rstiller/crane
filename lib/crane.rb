#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra/base"

module Crane
    
    require "version"
    require "config"
    require "log"
    require "database"
    require "crane/util/scheduler"
    
    class App < Sinatra::Base
        
        scheduler = Crane::Scheduler.new
        Crane::log.info "scheduler started"
        
    end
    
end

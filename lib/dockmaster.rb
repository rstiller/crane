#!/usr/bin/env ruby

# resolve local files
$:.unshift File.dirname(__FILE__)

require "sinatra"
require "configliere"
require "sequel"
require "fileutils"
require "logger"

# main application module
module Dockmaster
    
    require "dockmaster/util/hashToObject"
    
    Settings.read "./config/defaults.yml"
    Settings.read "/etc/dockmaster/config.yml"
    Settings.resolve!
    
    @logger = Logger.new(STDOUT)
    #@logger = Logger.new(Settings["logging.file"], Settings["logging.period"])
    
    if Settings["logging.level"] == "UNKNOWN"
        @logger.level = Logger::UNKNOWN
    elsif Settings["logging.level"] == "FATAL"
        @logger.level = Logger::FATAL
    elsif Settings["logging.level"] == "ERROR"
        @logger.level = Logger::ERROR
    elsif Settings["logging.level"] == "WARN"
        @logger.level = Logger::WARN
    elsif Settings["logging.level"] == "INFO"
        @logger.level = Logger::INFO
    elsif Settings["logging.level"] == "DEBUG"
        @logger.level = Logger::DEBUG
    end
    
    def self.log
        @logger
    end
    
    unless File.directory?(File.dirname(Settings["db.path"]))
        
        FileUtils.mkdir_p(File.dirname(Settings["db.path"]))
            
    end
    
    @database = Sequel.connect("sqlite://" + Settings["db.path"])
    
    require "dockmaster/models/project"
    require "dockmaster/util/scheduler"
    
    class App
        
        Dockmaster::Models::Project.doInTransaction do
            
            unless Dockmaster::Models::Project[:name => "jpuppet/java"]
                
                project = Dockmaster::Models::Project.new
                project[:name] = "jpuppet/java"
                project[:url] = "https://github.com/jpuppet/java.git"
                project.save
                
                Dockmaster::log.info "new test-project saved"
                
            end
            
        end
        
        scheduler = Dockmaster::Scheduler.new
        Dockmaster::log.info "scheduler started"
        
    end
    
end

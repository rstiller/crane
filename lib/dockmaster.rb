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
    
    VERSION = "0.0.1"
    
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
    
    @database = Sequel.connect("sqlite://" + Settings["db.path"], :max_connections => 20)
    
    def self.tx
        
        begin
        
            yield
            
        rescue => exception
            
            Dockmaster::log.error exception
            
            raise Sequel::Rollback
            
        end
        
    end
    
    require "dockmaster/models/project"
    require "dockmaster/util/scheduler"
    
    class App
        
        Dockmaster::tx do
            
            unless Dockmaster::Models::Project[:name => "dockmaster-example"]
                
                project = Dockmaster::Models::Project.new :name => "dockmaster-example", :url => "https://github.com/rstiller/dockmaster-example.git"
                project.save
                
                branch = Dockmaster::Models::WorkingCopy.new :name => "master", :type => "branch"
                project.add_workingCopy branch
                
                Dockmaster::log.info "new test-project saved"
                
            end
            
            project = Dockmaster::Models::Project[:name => "dockmaster-example"]
            
            Dockmaster::log.info "#{project.name} (#{project.url})"
            project.workingCopy_dataset.each do |workingCopy|
                Dockmaster::log.info "    - #{workingCopy.name} (#{workingCopy.type} - #{workingCopy.ref})"
                workingCopy.buildHistory_dataset.each do |buildHistory|
                    Dockmaster::log.info "        * #{buildHistory.date} - #{buildHistory.successful} (#{buildHistory.ref})"
                end
            end
            
        end
        
        scheduler = Dockmaster::Scheduler.new
        Dockmaster::log.info "scheduler started"
        
    end
    
end

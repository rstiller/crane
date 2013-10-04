
require "logger"
require "config"

module Crane
    
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
    
end


require "sequel"
require "config"

module Crane
    
    unless File.directory? File.dirname(Settings["db.path"])
        
        FileUtils.mkdir_p File.dirname(Settings["db.path"])
            
    end
    
    @database = Sequel.sqlite(Settings["db.path"], :max_connections => 20)
    
    def self.tx
        
        begin
        
            yield
            
        rescue => exception
            
            Crane::log.error exception
            
            raise Sequel::Rollback
            
        end
        
    end
    
end


require "sequel"
require "config"

module Dockmaster
    
    unless File.directory? File.dirname(Settings["db.path"])
        
        FileUtils.mkdir_p File.dirname(Settings["db.path"])
            
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
    
end

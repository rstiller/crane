
require 'rubygems'
require 'rufus/scheduler'

module Dockmaster
    
    class Scheduler
        
        scheduler = Rufus::Scheduler.start_new
        
        scheduler.every '2s' do
            
            # https://github.com/torvalds/linux.git
            
        end
    
    end

end

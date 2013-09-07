
require 'rubygems'
require 'rufus/scheduler'

require 'dockmaster/models/project'
require 'dockmaster/util/git'
require 'dockmaster/util/threadpool'

module Dockmaster
    
    class Scheduler
        
        def initialize(worker = 4)
            
            @scheduler = Rufus::Scheduler.start_new
            @threadpool = ThreadPool.new worker
            @git = Dockmaster::Git.new
            
            @scheduler.every '10s' do
                
                Dockmaster::Models::Project.each do |project|
                    
                    func = Proc.new do |dist, *args|
                       
                        puts project.name, project.url
                        tags = @git.remoteTags project.url
                        
                        puts tags
                        
                    end
                    
                    @threadpool.submit func
                    
                end
                
            end
            
        end
    
    end

end

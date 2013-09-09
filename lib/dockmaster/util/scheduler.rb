
require "rubygems"
require "rufus/scheduler"

require "dockmaster/models/project"
require "dockmaster/models/workingCopy"
require "dockmaster/util/git"
require "dockmaster/util/threadpool"

module Dockmaster
    
    class Scheduler
        
        def initialize(worker = 4)
            
            @scheduler = Rufus::Scheduler.start_new
            @threadpool = ThreadPool.new worker
            
            @scheduler.every "10s" do
                
                Dockmaster::Models::Project.forEachProject do |project|
                    
                    func = Proc.new do |dist, *args|
                        
                        begin
                            
                            tags = Dockmaster::Git.remoteTags project.url
                            checkTags project, tags
                            
                        rescue => exception
                            
                            puts exception, exception.backtrace
                            
                        end
                        
                    end
                    
                    @threadpool.submit func
                    
                end
                
            end
            
        end
        
        def checkTags(project, remoteTags)
            
            Dockmaster::Models::Project.doInTransaction do
                
                oldTags = project.workingCopy_dataset.map(:name)
                newTags = remoteTags.select { |key| !oldTags.include? key }
                
                newTags.each do |name, ref|
                    
                    tag = Models::WorkingCopy.new(:type => "tag", :name => name, :ref => ref)
                    project.add_workingCopy tag
                    
                    # TODO: trigger build
                    
                end
                
            end
            
        end
    
    end

end

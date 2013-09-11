
require "rubygems"
require "rufus/scheduler"
require "configliere"

require "dockmaster/models/project"
require "dockmaster/models/workingCopy"
require "dockmaster/util/git"
require "dockmaster/util/threadpool"

module Dockmaster
    
    class Scheduler
        
        def initialize(checkoutWorker = 4, buildWorker = 16)
            
            @scheduler = Rufus::Scheduler.start_new
            @checkoutThreadpool = ThreadPool.new checkoutWorker
            @workerThreadpool = ThreadPool.new buildWorker
            
            Dockmaster::log.info "initialize - scheduler initialized with #{checkoutWorker} check workers and #{buildWorker} build workers"
            
            @scheduler.every Settings["schedule.check"] do
                
                Dockmaster::Models::Project.forEachProject do |project|
                    
                    func = Proc.new do |dist, *args|
                        
                        begin
                            
                            tags = Dockmaster::Git.remoteTags project[:url]
                            checkTags project, tags
                            
                            branches = Dockmaster::Git.remoteBranches project[:url]
                            checkBranches project, branches
                            
                        rescue => exception
                            
                            puts exception, exception.backtrace
                            
                        end
                        
                    end
                    
                    @checkoutThreadpool.submit func
                    
                    Dockmaster::log.info "schedule - scheduled checking for project #{project[:name]} (#{project[:url]})"
                    
                end
                
            end
            
        end
        
        def checkBranches(project, remoteBranches)
            
            Dockmaster::Models::Project.doInTransaction do
                
                branches = project.workingCopy_dataset.where(:type => "branch").map(:name)
                
                Dockmaster::log.info "checkBranches - branches to check for project #{project[:name]} (#{project[:url]}): #{branches}"
                
                branches.each do |name|
                    
                    branch = project.workingCopy_dataset.where(:type => "branch", :name => name)
                    
                    if remoteBranches.has_key? name
                        
                        project.workingCopy_dataset.where(:type => "branch", :name => name).delete
                        
                        Dockmaster::log.info "checkBranches - branch #{name} not any longer in project #{project[:name]} (#{project[:url]}) - deleting branch"
                        
                    elsif remoteBranches[name] != branch[:ref]
                        
                        buildFunc = Proc.new do |dist, *args|
                            
                            begin
                                
                                branch.buildImages
                                
                            rescue => exception
                                
                                puts exception, exception.backtrace
                                
                            end
                            
                        end
                        
                        @workerThreadpool.submit buildFunc
                        
                        Dockmaster::log.info "checkBranches - branch #{name} changed for project #{project[:name]} (#{project[:url]}) - triggering rebuild"
                        
                    end
                    
                end
                
            end
            
        end
        
        def checkTags(project, remoteTags)
            
            Dockmaster::Models::Project.doInTransaction do
                
                oldTags = project.workingCopy_dataset.where(:type => "tag").map(:name)
                newTags = remoteTags.select { |key| !oldTags.include? key }
                    
                Dockmaster::log.info "checkTags - tags to check for project #{project[:name]} (#{project[:url]}): #{newTags}"
                
                newTags.each do |name, ref|
                    
                    tag = Models::WorkingCopy.new
                    tag[:ref] = ref
                    tag[:name] = name
                    tag[:type] = "tag"
                    
                    project.add_workingCopy tag
                    
                    Dockmaster::log.info "checkTags - tag #{name} added to project #{project[:name]} (#{project[:url]})"
                    
                    buildFunc = Proc.new do |dist, *args|
                        
                        begin
                            
                            tag.buildImages
                            
                        rescue => exception
                            
                            puts exception, exception.backtrace
                            
                        end
                        
                    end
                    
                    @workerThreadpool.submit buildFunc
                    
                    Dockmaster::log.info "checkTags - triggered build for tag #{name} in project #{project[:name]} (#{project[:url]})"
                    
                end
                
            end
            
        end
    
    end

end

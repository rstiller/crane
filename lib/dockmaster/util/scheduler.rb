
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
            Dockmaster::log.info "initialize - executing every #{Settings['schedule.check']} check for new versions"
            
            @scheduler.every Settings["schedule.check"] do
                
                Dockmaster::Models::Project.forEachProject do |project|
                    
                    func = Proc.new do |dist, *args|
                        
                        begin
                            
                            if project.buildsTags?
                                
                                tags = Dockmaster::Git.remoteTags project.url
                                checkTags project, tags
                                
                            end
                            
                            branches = Dockmaster::Git.remoteBranches project.url
                            checkBranches project, branches
                            
                        rescue => exception
                            
                            Dockmaster::log.error exception
                            
                        end
                        
                    end
                    
                    @checkoutThreadpool.submit func
                    
                    Dockmaster::log.info "schedule - scheduled checking for project '#{project.name}' (#{project.url})"
                    
                end
                
            end
            
        end
        
        def buildImage(project, localWorkingCopy, remoteWorkingCopyRef)
            
            buildHistory = nil
            
            Dockmaster::tx do
                
                buildHistory = Dockmaster::Models::BuildHistory.new
                buildHistory.ref = remoteWorkingCopyRef
                buildHistory.date = Time.now
                buildHistory.successful = 0
                
                localWorkingCopy.add_buildHistory buildHistory
                
            end
            
            begin
                
                # TODO: make monitors available
                monitors = localWorkingCopy.buildImages project, buildHistory
                
                Dockmaster::tx do
                    
                    localWorkingCopy.ref = remoteWorkingCopyRef
                    localWorkingCopy.save
                    
                    buildHistory.successful = 1
                    
                end
                
            rescue => exception
                
                Dockmaster::log.error exception
                
            end
            
            Dockmaster::tx do
                
                buildHistory.save
                
            end
            
        end
        
        def buildImageProc(project, workingCopy, ref)
            
            Proc.new do |dist, *args|
                
                begin
                    
                    buildImage project, workingCopy, ref
                    
                rescue => exception

                    Dockmaster::log.error exception
                    
                end
                
            end
            
        end
        
        def checkBranches(project, remoteBranches)
            
            procs = []
            
            Dockmaster::tx do
                
                branches = Dockmaster::Models::WorkingCopy.where(:project_id => project.id, :type => "branch")
                
                Dockmaster::log.info "checkBranches - branches to check for project '#{project.name}' (#{project.url}): #{branches}"
                
                branches.each do |branch|
                    
                    if !remoteBranches.has_key? branch.name
                        
                        branch.delete
                        
                        Dockmaster::log.info "checkBranches - branch '#{branch.name}' not any longer in project '#{project.name}' (#{project.url}) - deleting branch"
                        
                    elsif remoteBranches[branch.name] != branch.ref
                        
                        proc = buildImageProc project, branch, remoteBranches[branch.name]
                        procs.push proc
                        
                        Dockmaster::log.info "checkBranches - branch '#{branch.name}' changed (from '#{branch.ref}' to '#{remoteBranches[branch.name]}') " +
                            "for project '#{project.name}' (#{project.url}) - triggering (re)build"
                        
                    end
                    
                end
                
            end
            
            procs.each do |proc|
                
                @workerThreadpool.submit proc
                
            end
            
        end
        
        def checkTags(project, remoteTags)
            
            procs = []
            
            Dockmaster::tx do
                
                oldTags = project.workingCopy_dataset.where(:type => "tag").map(:name)
                newTags = remoteTags.select { |key| !oldTags.include? key }
                    
                Dockmaster::log.info "checkTags - tags to check for project #{project.name} (#{project.url}): #{newTags}"
                
                newTags.each do |name, ref|
                    
                    tag = Models::WorkingCopy.new
                    tag[:ref] = ref
                    tag[:name] = name
                    tag[:type] = "tag"
                    project.add_workingCopy tag
                    
                    Dockmaster::log.info "checkTags - tag '#{name}' added to project '#{project.name}' (#{project.url})"
                    
                    proc = buildImageProc project, tag, ref
                    procs.push proc
                    
                    Dockmaster::log.info "checkTags - triggered build for tag '#{name}' in project '#{project.name}' (#{project.url})"
                    
                end
                
            end
            
            procs.each do |proc|
                
                @workerThreadpool.submit proc
                
            end
            
        end
    
    end

end


require "rubygems"
require "rufus/scheduler"
require "configliere"

require "crane/models/project"
require "crane/models/workingCopy"
require "crane/util/git"
require "crane/util/threadpool"

module Crane
    
    class Scheduler
        
        def initialize(checkoutWorker = 4, buildWorker = 16)
            
            @scheduler = Rufus::Scheduler.new
            @checkoutThreadpool = ThreadPool.new checkoutWorker
            @workerThreadpool = ThreadPool.new buildWorker
            
            Crane::log.info "initialize - scheduler initialized with #{checkoutWorker} check workers and #{buildWorker} build workers"
            Crane::log.info "initialize - executing every #{Settings['schedule.check']} check for new versions"
            
            @scheduler.every Settings["schedule.check"] do
                
                Crane::Models::Project.forEachProject do |project|
                    
                    checkProject project
                    
                end
                
            end
            
        end
        
        def checkProject(project)
            
            func = Proc.new do |dist, *args|
                
                begin
                    
                    if project.buildsTags?
                        
                        tags = Crane::Git.remoteTags project.url
                        checkTags project, tags
                        
                    end
                    
                    branches = Crane::Git.remoteBranches project.url
                    checkBranches project, branches
                    
                rescue => exception
                    
                    Crane::log.error exception
                    
                end
                
            end
            
            @checkoutThreadpool.submit func
            
            Crane::log.info "checkProject - scheduled checking for project '#{project.name}' (#{project.url})"
            
        end
        
        def self.buildImage(project, localWorkingCopy, remoteWorkingCopyRef)
            
            buildHistory = nil
            monitors = nil
            
            Crane::tx do
                
                buildHistory = Crane::Models::BuildHistory.new
                buildHistory.ref = remoteWorkingCopyRef
                buildHistory.date = Time.now
                buildHistory.successful = Crane::Models::BuildHistory::BUILD_BROKEN
                
                localWorkingCopy.add_buildHistory buildHistory
                
            end
            
            begin
                
                monitors = localWorkingCopy.buildImages project, buildHistory
                
                Crane::tx do
                    
                    localWorkingCopy.ref = remoteWorkingCopyRef
                    localWorkingCopy.save
                    
                    buildHistory.successful = Crane::Models::BuildHistory::BUILD_SUCCESSFUL
                    
                end
                
            rescue => exception
                
                Crane::log.error exception
                
            end
            
            Crane::tx do
                
                buildHistory.save
                
            end
            
            monitors
            
        end
        
        def buildImageProc(project, workingCopy, ref)
            
            Proc.new do |dist, *args|
                
                begin
                    
                    buildImage project, workingCopy, ref
                    
                rescue => exception

                    Crane::log.error exception
                    
                end
                
            end
            
        end
        
        def checkBranch(project, branch, remoteBranches, procs)
            
            if !remoteBranches.has_key? branch.name
                
                branch.delete
                
                Crane::log.info "checkBranches - branch '#{branch.name}' not any longer in project '#{project.name}' (#{project.url}) - deleting branch"
                
            elsif remoteBranches[branch.name] != branch.ref
                
                procs.push buildImageProc(project, branch, remoteBranches[branch.name])
                
                Crane::log.info "checkBranches - branch '#{branch.name}' changed (from '#{branch.ref}' to '#{remoteBranches[branch.name]}') " +
                    "for project '#{project.name}' (#{project.url}) - triggering (re)build"
                
            end
            
        end
        
        def checkBranches(project, remoteBranches)
            
            procs = []
            
            branches = Crane::Models::WorkingCopy.where(:project_id => project.id, :type => "branch")
            
            Crane::log.info "checkBranches - branches to check for project '#{project.name}' (#{project.url}): #{branches}"
            
            branches.each do |branch|
                
                checkBranch project, branch, remoteBranches, procs
                
            end
            
            procs.each do |proc|
                
                @workerThreadpool.submit proc
                
            end
            
        end
        
        def newTag(project, name, ref)
            
            tag = Models::WorkingCopy.new :ref => ref, :name => name, :type => "tag"
            project.add_workingCopy tag
            
            Crane::log.info "newTag - tag '#{name}' added to project '#{project.name}' (#{project.url})"
            
            tag
            
        end
        
        def newRemoteTags(project, remoteTags)
            
            oldTags = Crane::Models::WorkingCopy.where(:project_id => project.id, :type => "tag").map(:name)
            remoteTags.select { |key| !oldTags.include? key }
            
        end
        
        def checkTags(project, remoteTags)
            
            procs = []
            newTags = newRemoteTags project, remoteTags
            
            Crane::log.info "checkTags - tags to check for project #{project.name} (#{project.url}): #{newTags}"
            
            newTags.each do |name, ref|
                
                tag = newTag project, name, ref
                
                procs.push buildImageProc(project, tag, ref)
                
                Crane::log.info "checkTags - triggered build for tag '#{name}' in project '#{project.name}' (#{project.url})"
                
            end
            
            procs.each do |proc|
                
                @workerThreadpool.submit proc
                
            end
            
        end
    
    end

end

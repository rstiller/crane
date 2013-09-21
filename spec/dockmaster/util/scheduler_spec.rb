
require "sequel"

describe "Scheduler" do
    
    require "config"    
    
    Settings["db.path"] = ":memory:"
    Settings["logging.level"] = "ERROR"
    
    require "log"
    require "database"
    require "dockmaster/util/scheduler"
    
    context "new" do
        
        it "new scheduler" do
            
            rufus = Rufus::Scheduler.start_new
            Settings["schedule.check"] = 60
            
            expect(Rufus::Scheduler).to receive(:start_new).and_return(rufus)
            expect(Dockmaster::ThreadPool).to receive(:new).with(2)
            expect(Dockmaster::ThreadPool).to receive(:new).with(4)
            expect(rufus).to receive(:every).with(60)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
            
        end
        
    end
    
    context "checkProject" do
        
        it "check proc submission - check tags" do
            
            branches = {}
            tags = {}
            url = "url"
            project = Dockmaster::Models::Project.new
            pool = Dockmaster::ThreadPool.new 1
            func = Proc.new {}
            originalFunc = nil
            
            expect(Proc).to receive(:new) do |*args, &block|
                originalFunc = block
                func
            end
            
            expect(Dockmaster::ThreadPool).to receive(:new).twice.and_return(pool)
            expect(pool).to receive(:submit).with(func)
            
            scheduler = Dockmaster::Scheduler.new 1, 1
            scheduler.checkProject project
            
            expect(originalFunc).not_to eq(nil)
            
            expect(project).to receive(:url).twice.and_return(url)
            expect(project).to receive(:buildsTags?).and_return(true)
            
            expect(Dockmaster::Git).to receive(:remoteTags).with(url).and_return(tags)
            expect(scheduler).to receive(:checkTags).with(project, tags)
            
            expect(Dockmaster::Git).to receive(:remoteBranches).with(url).and_return(branches)
            expect(scheduler).to receive(:checkBranches).with(project, branches)
            
            originalFunc.call
            
        end
        
        it "check proc submission - don't check tags" do
            
            branches = {}
            url = "url"
            project = Dockmaster::Models::Project.new
            pool = Dockmaster::ThreadPool.new 1
            func = Proc.new {}
            originalFunc = nil
            
            expect(Proc).to receive(:new) do |*args, &block|
                originalFunc = block
                func
            end
            
            expect(Dockmaster::ThreadPool).to receive(:new).twice.and_return(pool)
            expect(pool).to receive(:submit).with(func)
            
            scheduler = Dockmaster::Scheduler.new 1, 1
            scheduler.checkProject project
            
            expect(originalFunc).not_to eq(nil)
            
            expect(project).to receive(:url).once.and_return(url)
            expect(project).to receive(:buildsTags?).and_return(false)
            
            expect(Dockmaster::Git).not_to receive(:remoteTags)
            expect(scheduler).not_to receive(:checkTags)
            
            expect(Dockmaster::Git).to receive(:remoteBranches).with(url).and_return(branches)
            expect(scheduler).to receive(:checkBranches).with(project, branches)
            
            originalFunc.call
            
        end
        
    end
    
    context "buildImage" do
        
        it "regular workflow" do
            
            project = Dockmaster::Models::Project.new
            localWorkingCopy = Dockmaster::Models::WorkingCopy.new
            remoteWorkingCopyRef = "ref_id"
            
            pool = Dockmaster::ThreadPool.new 1
            buildHistory = Dockmaster::Models::BuildHistory.new
            
            expect(Dockmaster::ThreadPool).to receive(:new).twice.and_return(pool)
            expect(Dockmaster::Models::BuildHistory).to receive(:new).and_return(buildHistory)
            expect(buildHistory).to receive(:ref=).with(remoteWorkingCopyRef)
            expect(buildHistory).to receive(:date=)
            expect(buildHistory).to receive(:successful=).with(Dockmaster::Models::BuildHistory::BUILD_BROKEN)
            expect(buildHistory).to receive(:successful=).with(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(localWorkingCopy).to receive(:add_buildHistory).with(buildHistory)
            expect(localWorkingCopy).to receive(:buildImages).with(project, buildHistory)
            expect(localWorkingCopy).to receive(:ref=).with(remoteWorkingCopyRef)
            expect(localWorkingCopy).to receive(:save)
            expect(buildHistory).to receive(:save)
            
            scheduler = Dockmaster::Scheduler.new 1, 1
            scheduler.buildImage project, localWorkingCopy, remoteWorkingCopyRef
            
        end
        
    end
    
    context "buildImageProc" do
        
        it "check buildImage call" do
            
            project = Dockmaster::Models::Project.new
            localWorkingCopy = Dockmaster::Models::WorkingCopy.new
            remoteWorkingCopyRef = "ref_id"
            pool = Dockmaster::ThreadPool.new 1
            func = Proc.new {}
            originalFunc = nil
            
            expect(Dockmaster::ThreadPool).to receive(:new).twice.and_return(pool)
            expect(Proc).to receive(:new) do |*args, &block|
                originalFunc = block
                func
            end
            
            scheduler = Dockmaster::Scheduler.new 1, 1
            scheduler.buildImageProc project, localWorkingCopy, remoteWorkingCopyRef
            
            expect(scheduler).to receive(:buildImage).with(project, localWorkingCopy, remoteWorkingCopyRef)
            
            originalFunc.call
            
        end
        
    end
    
    context "checkBranches" do
        
        it "no local or remote branches" do
            
            checkPool = Dockmaster::ThreadPool.new 1
            workerPool = Dockmaster::ThreadPool.new 1
            project = Dockmaster::Models::Project.new
            localBranches = []
            remoteBranches = {}
            
            expect(project).to receive(:id).and_return(1)
            expect(Dockmaster::ThreadPool).to receive(:new).with(2).and_return(checkPool)
            expect(Dockmaster::ThreadPool).to receive(:new).with(4).and_return(workerPool)
            expect(Dockmaster::Models::WorkingCopy).to receive(:where).with(:project_id => 1, :type => "branch").and_return(localBranches)
            expect(workerPool).not_to receive(:submit)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
            scheduler.checkBranches project, remoteBranches
            
        end
        
        it "old local branch" do
            
            checkPool = Dockmaster::ThreadPool.new 1
            workerPool = Dockmaster::ThreadPool.new 1
            project = Dockmaster::Models::Project.new
            oldBranch = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "master_ref_id"
            localBranches = [
                oldBranch
            ]
            remoteBranches = { "develop" => "ref_id" }
            
            expect(project).to receive(:id).and_return(1)
            expect(Dockmaster::ThreadPool).to receive(:new).with(2).and_return(checkPool)
            expect(Dockmaster::ThreadPool).to receive(:new).with(4).and_return(workerPool)
            expect(Dockmaster::Models::WorkingCopy).to receive(:where).with(:project_id => 1, :type => "branch").and_return(localBranches)
            expect(oldBranch).to receive(:delete)
            expect(workerPool).not_to receive(:submit)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
            scheduler.checkBranches project, remoteBranches
            
        end
        
        it "no new ref for branch" do
            
            checkPool = Dockmaster::ThreadPool.new 1
            workerPool = Dockmaster::ThreadPool.new 1
            project = Dockmaster::Models::Project.new
            oldBranch = Dockmaster::Models::WorkingCopy.new :name => "develop", :ref => "ref_id"
            localBranches = [
                oldBranch
            ]
            remoteBranches = { "develop" => "ref_id" }
            
            expect(project).to receive(:id).and_return(1)
            expect(Dockmaster::ThreadPool).to receive(:new).with(2).and_return(checkPool)
            expect(Dockmaster::ThreadPool).to receive(:new).with(4).and_return(workerPool)
            expect(Dockmaster::Models::WorkingCopy).to receive(:where).with(:project_id => 1, :type => "branch").and_return(localBranches)
            expect(oldBranch).not_to receive(:delete)
            expect(workerPool).not_to receive(:submit)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
            scheduler.checkBranches project, remoteBranches
            
        end
        
        it "new ref for branch" do
            
            checkPool = Dockmaster::ThreadPool.new 1
            workerPool = Dockmaster::ThreadPool.new 1
            project = Dockmaster::Models::Project.new
            oldBranch = Dockmaster::Models::WorkingCopy.new :name => "develop", :ref => "ref_id"
            localBranches = [
                oldBranch
            ]
            remoteBranches = { "develop" => "new_ref_id" }
            func = Proc.new {}
            
            expect(project).to receive(:id).and_return(1)
            expect(Dockmaster::ThreadPool).to receive(:new).with(2).and_return(checkPool)
            expect(Dockmaster::ThreadPool).to receive(:new).with(4).and_return(workerPool)
            expect(Dockmaster::Models::WorkingCopy).to receive(:where).with(:project_id => 1, :type => "branch").and_return(localBranches)
            expect(oldBranch).not_to receive(:delete)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
            
            expect(scheduler).to receive(:buildImageProc).with(project, oldBranch, "new_ref_id").and_return(func)
            expect(workerPool).to receive(:submit).with(func)
            
            scheduler.checkBranches project, remoteBranches
            
        end
        
    end
    
    context "checkTags" do
        
        it "no local or remote tags" do
            
            checkPool = Dockmaster::ThreadPool.new 1
            workerPool = Dockmaster::ThreadPool.new 1
            project = Dockmaster::Models::Project.new
            localTag = Dockmaster::Models::WorkingCopy.new :name => "v1.0.0", :ref => "1.0.0"
            localTags = [
                localTag
            ]
            remoteTags = {}
            func = Proc.new {}
            
            expect(project).to receive(:id).and_return(1)
            expect(Dockmaster::ThreadPool).to receive(:new).with(2).and_return(checkPool)
            expect(Dockmaster::ThreadPool).to receive(:new).with(4).and_return(workerPool)
            expect(Dockmaster::Models::WorkingCopy).to receive(:where).with(:project_id => 1, :type => "tag").and_return(localTags)
            expect(localTags).to receive(:map).with(:name).and_return([])
            expect(workerPool).not_to receive(:submit)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
            scheduler.checkTags project, remoteTags
            
        end
        
        it "new remote tag" do
            
            checkPool = Dockmaster::ThreadPool.new 1
            workerPool = Dockmaster::ThreadPool.new 1
            project = Dockmaster::Models::Project.new
            localTag = Dockmaster::Models::WorkingCopy.new :name => "v1.0.0", :ref => "1.0.0"
            remoteTag = Dockmaster::Models::WorkingCopy.new :name => "v2.0.0", :ref => "new_ref_id"
            localTags = [
                localTag
            ]
            remoteTags = { remoteTag.name => remoteTag.ref }
            func = Proc.new {}
            
            expect(project).to receive(:id).and_return(1)
            expect(Dockmaster::ThreadPool).to receive(:new).with(2).and_return(checkPool)
            expect(Dockmaster::ThreadPool).to receive(:new).with(4).and_return(workerPool)
            expect(Dockmaster::Models::WorkingCopy).to receive(:where).with(:project_id => 1, :type => "tag").and_return(localTags)
            expect(localTags).to receive(:map).with(:name).and_return(["v1.0.0"])
            expect(workerPool).to receive(:submit).with(func)
            expect(Dockmaster::Models::WorkingCopy).to receive(:new).with(:ref => remoteTag.ref, :name => remoteTag.name, :type => "tag").and_return(remoteTag)
            expect(project).to receive(:add_workingCopy).with(remoteTag)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
            
            expect(scheduler).to receive(:buildImageProc).with(project, remoteTag, remoteTag.ref).and_return(func)
            
            scheduler.checkTags project, remoteTags
            
        end
        
    end
    
end

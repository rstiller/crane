
require "sequel"

describe "Scheduler" do
    
    require "config"    
    
    Settings["db.path"] = ":memory:"
    Settings["logging.level"] = "FATAL"
    
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
            func = Proc.new do
            end
            originalFunc = nil
            
            expect(Proc).to receive(:new) do |*args, &block|
                originalFunc = block
                func
            end
            
            expect(Dockmaster::ThreadPool).to receive(:new).twice.and_return(pool)
            expect(pool).to receive(:submit).with(func)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
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
            func = Proc.new do
            end
            originalFunc = nil
            
            expect(Proc).to receive(:new) do |*args, &block|
                originalFunc = block
                func
            end
            
            expect(Dockmaster::ThreadPool).to receive(:new).twice.and_return(pool)
            expect(pool).to receive(:submit).with(func)
            
            scheduler = Dockmaster::Scheduler.new 2, 4
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
        
        it "nothing" do
        end
        
    end
    
    context "buildImageProc" do
        
        it "nothing" do
        end
        
    end
    
    context "checkBranches" do
        
        it "nothing" do
        end
        
    end
    
    context "checkTags" do
        
        it "nothing" do
        end
        
    end
    
end

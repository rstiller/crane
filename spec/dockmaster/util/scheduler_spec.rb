
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
        
        it "nothing" do
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

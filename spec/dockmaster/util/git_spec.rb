
require "dockmaster/util/git"

describe "Git" do
    
    context "clone" do
        
        it "no args" do
            
            expect {
                Dockmaster::Git.clone
            }.to raise_error
            
        end
        
        it "url and folder" do
            
            Open3.should_receive(:popen3).with("git clone --recursive myUrl myFolder")
            Dockmaster::Git.clone "myUrl", "myFolder"
            
        end
        
    end
    
    context "fetch" do
        
        it "no args" do
            
            expect {
                Dockmaster::Git.fetch
            }.to raise_error
            
        end
        
        it "with folder" do
            
            Open3.should_receive(:popen3).with("git fetch", :chdir => "myFolder")
            Dockmaster::Git.fetch "myFolder"
            
        end
        
    end
    
    context "checkout" do
        
        it "no args" do
            
            expect {
                Dockmaster::Git.checkout
            }.to raise_error
            
        end
        
        it "with folder and workingCopy" do
            
            Open3.should_receive(:popen3).with("git checkout myWorkingCopy", :chdir => "myFolder")
            Dockmaster::Git.checkout "myWorkingCopy", "myFolder"
            
        end
        
    end
    
    context "pull" do
        
        it "no args" do
            
            expect {
                Dockmaster::Git.pull
            }.to raise_error
            
        end
        
        it "with folder and workingCopy" do
            
            Open3.should_receive(:popen3).with("git pull origin myWorkingCopy", :chdir => "myFolder")
            Dockmaster::Git.pull "myWorkingCopy", "myFolder"
            
        end
        
    end
    
    context "remoteTags" do
        
        it "no args" do
            
            expect {
                Dockmaster::Git.remoteTags
            }.to raise_error
            
        end
        
        it "with url" do
            
            Open3.should_receive(:popen3).with("git ls-remote --tags myUrl")
            Dockmaster::Git.remoteTags "myUrl"
            
        end
        
        it "check hash values" do
            
            remoteTags = Dockmaster::Git.remoteTags "https://github.com/rstiller/dockmaster-example"
            
            expect(remoteTags["v1.0.0"]).to eq("2977b0130764c45dbdd8af220d3fb5e4505dc829")
            expect(remoteTags["v1.1.0"]).to eq("5df15a886cb448bd76a9bfbd212fadf0572cf9ff")
            
        end
        
    end
    
    context "remoteBranches" do
        
        it "no args" do
            
            expect {
                Dockmaster::Git.remoteBranches
            }.to raise_error
            
        end
        
        it "with url" do
            
            Open3.should_receive(:popen3).with("git ls-remote --heads myUrl")
            Dockmaster::Git.remoteBranches "myUrl"
            
        end
        
        it "check hash values" do
            
            remoteBranches = Dockmaster::Git.remoteBranches "https://github.com/rstiller/dockmaster-example"
            
            expect(remoteBranches["rspec/test"]).to eq("8fb9073ad9a292bea926dbebbc394805afc18192")
            
        end
        
    end
    
end

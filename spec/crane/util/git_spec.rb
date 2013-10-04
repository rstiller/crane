
require "crane/util/git"

describe "Git" do
    
    context "clone" do
        
        it "no args" do
            
            expect {
                Crane::Git.clone
            }.to raise_error
            
        end
        
        it "url and folder" do
            
            Open3.should_receive(:popen3).with("git clone --recursive myUrl myFolder")
            Crane::Git.clone "myUrl", "myFolder"
            
        end
        
    end
    
    context "fetch" do
        
        it "no args" do
            
            expect {
                Crane::Git.fetch
            }.to raise_error
            
        end
        
        it "with folder" do
            
            Open3.should_receive(:popen3).with("git fetch", :chdir => "myFolder")
            Crane::Git.fetch "myFolder"
            
        end
        
    end
    
    context "checkout" do
        
        it "no args" do
            
            expect {
                Crane::Git.checkout
            }.to raise_error
            
        end
        
        it "with folder and workingCopy" do
            
            Open3.should_receive(:popen3).with("git checkout myWorkingCopy", :chdir => "myFolder")
            Crane::Git.checkout "myWorkingCopy", "myFolder"
            
        end
        
    end
    
    context "pull" do
        
        it "no args" do
            
            expect {
                Crane::Git.pull
            }.to raise_error
            
        end
        
        it "with folder and workingCopy" do
            
            Open3.should_receive(:popen3).with("git pull origin myWorkingCopy", :chdir => "myFolder")
            Crane::Git.pull "myWorkingCopy", "myFolder"
            
        end
        
    end
    
    context "remoteTags" do
        
        it "no args" do
            
            expect {
                Crane::Git.remoteTags
            }.to raise_error
            
        end
        
        it "with url" do
            
            Open3.should_receive(:popen3).with("git ls-remote --tags myUrl")
            Crane::Git.remoteTags "myUrl"
            
        end
        
        it "check hash values" do
            
            remoteTags = Crane::Git.remoteTags "https://github.com/rstiller/crane-example"
            
            expect(remoteTags["v1.0.0"]).to eq("2977b0130764c45dbdd8af220d3fb5e4505dc829")
            expect(remoteTags["v1.1.0"]).to eq("5df15a886cb448bd76a9bfbd212fadf0572cf9ff")
            
        end
        
    end
    
    context "remoteBranches" do
        
        it "no args" do
            
            expect {
                Crane::Git.remoteBranches
            }.to raise_error
            
        end
        
        it "with url" do
            
            Open3.should_receive(:popen3).with("git ls-remote --heads myUrl")
            Crane::Git.remoteBranches "myUrl"
            
        end
        
        it "check hash values" do
            
            remoteBranches = Crane::Git.remoteBranches "https://github.com/rstiller/crane-example"
            
            expect(remoteBranches["rspec/test"]).to eq("8fb9073ad9a292bea926dbebbc394805afc18192")
            
        end
        
    end
    
end

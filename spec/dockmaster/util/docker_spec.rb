
require "dockmaster/util/docker"

describe "Docker" do
    
    context "build" do
        
        it "no args" do
            
            expect {
                Dockmaster::Docker.build
            }.to raise_error
            
        end
        
        it "file, name and tag" do
            
            File.should_receive(:dirname).with("myFile").and_return("myFolder")
            Open3.should_receive(:popen3).with("docker build -t myName:myTag .", :chdir => "myFolder")
            Dockmaster::Docker.build "myFile", "myName", "myTag"
            
        end
        
    end
    
end

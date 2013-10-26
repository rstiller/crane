
require "rspec"
require "rack/test"
require "sequel"
require "json"

describe 'BaseImageControllerTest' do
    
    require "config"
    
    Settings["db.path"] = ":memory:"
    Settings["logging.level"] = "ERROR"
    
    require "log"
    require "database"
    require "crane/controller/api/api"
        
    include Rack::Test::Methods
    
    def app
        Crane::Controller::Api
    end
    
    context "all baseImages" do
        
        it "no baseImages available" do
            
            Crane::Models::BaseImage.where.delete
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            expect(response["_links"]["self"]["href"]).to eq("/baseImages")
            expect(response["_links"]["new"]["href"]).to eq("/baseImages")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/baseImages/{id}")
            
        end
        
        it "one baseImage available" do
            
            Crane::Models::BaseImage.where.delete
            baseImage = Crane::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("ubuntu")
            expect(response["elements"][0]["baseImage"]).to eq("base")
            expect(response["elements"][0]["version"]).to eq("1.0.0")
            expect(response["elements"][0]["date"]).to eq(nil)
            expect(response["elements"][0]["provision"]).to eq(nil)
            expect(response["elements"][0]["provisionVersion"]).to eq(nil)
            expect(response["elements"][0]["_links"]["self"]["href"]).to eq("/baseImages/1")
            expect(response["elements"][0]["_links"]["delete"]["href"]).to eq("/baseImages/1")
            expect(response["elements"][0]["_links"]["delete"]["method"]).to eq("delete")
            expect(response["elements"][0]["_links"]["update"]["href"]).to eq("/baseImages/1")
            expect(response["elements"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/baseImages")
            expect(response["_links"]["new"]["href"]).to eq("/baseImages")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/baseImages/{id}")
            
        end
        
        it "one baseImage with packages available" do
            
            Crane::Models::BaseImage.where.delete
            baseImage = Crane::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            package = Crane::Models::Package.new :name => "ruby", :version => "1.9.3"
            baseImage.add_package package
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("ubuntu")
            expect(response["elements"][0]["baseImage"]).to eq("base")
            expect(response["elements"][0]["version"]).to eq("1.0.0")
            expect(response["elements"][0]["date"]).to eq(nil)
            expect(response["elements"][0]["provision"]).to eq(nil)
            expect(response["elements"][0]["provisionVersion"]).to eq(nil)
            expect(response["elements"][0]["packages"][0]["name"]).to eq("ruby")
            expect(response["elements"][0]["packages"][0]["version"]).to eq("1.9.3")
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/baseImages")
            expect(response["_links"]["new"]["href"]).to eq("/baseImages")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/baseImages/{id}")
            
        end
        
    end
    
    context "single baseImage" do
        
        it "no baseImages available" do
            
            Crane::Models::BaseImage.where.delete
            
            get "/baseImages/0"
            
            expect(last_response).not_to be_ok
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "get a single baseImage" do
            
            Crane::Models::BaseImage.where.delete
            baseImage = Crane::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            get "/baseImages/#{id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["date"]).to eq(nil)
            expect(response["provision"]).to eq(nil)
            expect(response["provisionVersion"]).to eq(nil)
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/#{id}")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/#{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/#{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
    context "new single baseImage" do
        
        it "new baseImage full data-set" do
            
            Crane::Models::BaseImage.where.delete
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            post "/baseImages", '{"name":"ubuntu", "version":"1.0.0", "baseImage":"base","provision":"shell","provisionVersion":"1"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["provision"]).to eq("shell")
            expect(response["provisionVersion"]).to eq("1")
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/4")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/4")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/4")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/baseImages")
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("ubuntu")
            expect(response["elements"][0]["baseImage"]).to eq("base")
            expect(response["elements"][0]["version"]).to eq("1.0.0")
            expect(response["elements"][0]["date"]).to eq(nil)
            expect(response["elements"][0]["provision"]).to eq("shell")
            expect(response["elements"][0]["provisionVersion"]).to eq("1")
            expect(response["size"]).to eq(1)
            
        end
        
        it "new baseImage partial data-set" do
            
            Crane::Models::BaseImage.where.delete
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            post "/baseImages", '{"name":"ubuntu", "version":"1.0.0", "baseImage":"base"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["provision"]).to eq(nil)
            expect(response["provisionVersion"]).to eq(nil)
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/5")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/5")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/5")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/baseImages")
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("ubuntu")
            expect(response["elements"][0]["baseImage"]).to eq("base")
            expect(response["elements"][0]["version"]).to eq("1.0.0")
            expect(response["elements"][0]["date"]).to eq(nil)
            expect(response["elements"][0]["provision"]).to eq(nil)
            expect(response["elements"][0]["provisionVersion"]).to eq(nil)
            expect(response["size"]).to eq(1)
            
        end
        
        it "new baseImage with packages" do
            
            Crane::Models::BaseImage.where.delete
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            post "/baseImages", '{"name":"ubuntu", "version":"1.0.0", "baseImage":"base","packages":[{"name":"ruby","version":"1.9.3"},{"name":"htop","version":"1.0.1"}]}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["provision"]).to eq(nil)
            expect(response["provisionVersion"]).to eq(nil)
            expect(response["packages"][0]["name"]).to eq("ruby")
            expect(response["packages"][0]["version"]).to eq("1.9.3")
            expect(response["packages"][1]["name"]).to eq("htop")
            expect(response["packages"][1]["version"]).to eq("1.0.1")
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/6")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/6")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/6")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/baseImages")
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("ubuntu")
            expect(response["elements"][0]["baseImage"]).to eq("base")
            expect(response["elements"][0]["version"]).to eq("1.0.0")
            expect(response["elements"][0]["date"]).to eq(nil)
            expect(response["elements"][0]["provision"]).to eq(nil)
            expect(response["elements"][0]["provisionVersion"]).to eq(nil)
            expect(response["elements"][0]["packages"][0]["name"]).to eq("ruby")
            expect(response["elements"][0]["packages"][0]["version"]).to eq("1.9.3")
            expect(response["elements"][0]["packages"][1]["name"]).to eq("htop")
            expect(response["elements"][0]["packages"][1]["version"]).to eq("1.0.1")
            expect(response["size"]).to eq(1)
            
        end
        
    end
    
    context "delete baseImage" do
        
        it "no baseImage to delete available" do
            
            Crane::Models::BaseImage.where.delete
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            delete "/baseImages/0"
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "delete existing baseImage" do
            
            Crane::Models::BaseImage.where.delete
            baseImage = Crane::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            delete "/baseImages/#{id}"
            
            expect(last_response.status).to eq(204)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(0)
            
        end
        
    end
    
    context "update baseImage" do
        
        it "no baseImage to update available" do
            
            Crane::Models::BaseImage.where.delete
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            put "/baseImages/0", '{"provisioning":"shell"}'
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "update existing baseImage" do
            
            Crane::Models::BaseImage.where.delete
            baseImage = Crane::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            put "/baseImages/#{id}", '{"provision":"shell"}'
            
            expect(last_response.status).to eq(200)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["date"]).to eq(nil)
            expect(response["provision"]).to eq("shell")
            expect(response["provisionVersion"]).to eq(nil)
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/8")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/8")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/8")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
        it "update existing baseImage" do
            
            Crane::Models::BaseImage.where.delete
            baseImage = Crane::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            package = Crane::Models::Package.new :name => "ruby", :version => "1.9.3"
            baseImage.add_package package
            
            package = Crane::Models::Package.new :name => "htop", :version => "1.0.1"
            baseImage.add_package package
            
            response = double(HTTParty::Response)
            response.stub(:body).and_return("[]")
            expect(HTTParty).to receive(:get).at_least(:once).with("http://localhost:4243/images/json").and_return(response)
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("ubuntu")
            expect(response["elements"][0]["baseImage"]).to eq("base")
            expect(response["elements"][0]["version"]).to eq("1.0.0")
            expect(response["elements"][0]["date"]).to eq(nil)
            expect(response["elements"][0]["provision"]).to eq(nil)
            expect(response["elements"][0]["provisionVersion"]).to eq(nil)
            expect(response["elements"][0]["packages"].length).to eq(2)
            expect(response["elements"][0]["packages"][0]["name"]).to eq("ruby")
            expect(response["elements"][0]["packages"][0]["version"]).to eq("1.9.3")
            expect(response["elements"][0]["packages"][1]["name"]).to eq("htop")
            expect(response["elements"][0]["packages"][1]["version"]).to eq("1.0.1")
            expect(response["elements"][0]["_links"]["self"]["href"]).to eq("/baseImages/9")
            expect(response["elements"][0]["_links"]["delete"]["href"]).to eq("/baseImages/9")
            expect(response["elements"][0]["_links"]["delete"]["method"]).to eq("delete")
            expect(response["elements"][0]["_links"]["update"]["href"]).to eq("/baseImages/9")
            expect(response["elements"][0]["_links"]["update"]["method"]).to eq("put")
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            put "/baseImages/#{id}", '{"provision":"shell","packages":[{"name":"vim","version":"2.1.3"}]}'
            
            expect(last_response.status).to eq(200)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["date"]).to eq(nil)
            expect(response["provision"]).to eq("shell")
            expect(response["provisionVersion"]).to eq(nil)
            expect(response["packages"].length).to eq(1)
            expect(response["packages"][0]["name"]).to eq("vim")
            expect(response["packages"][0]["version"]).to eq("2.1.3")
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/9")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/9")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/9")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
end

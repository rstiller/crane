
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
    require "dockmaster/controller/api/api"
        
    include Rack::Test::Methods
    
    def app
        Dockmaster::Controller::Api
    end
    
    context "all baseImages" do
        
        it "no baseImages available" do
            
            Dockmaster::Models::BaseImage.where.delete
            
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
            
            Dockmaster::Models::BaseImage.where.delete
            baseImage = Dockmaster::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
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
            
            Dockmaster::Models::BaseImage.where.delete
            
            get "/baseImages/0"
            
            expect(last_response).not_to be_ok
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "get a single baseImage" do
            
            Dockmaster::Models::BaseImage.where.delete
            baseImage = Dockmaster::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
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
            
            Dockmaster::Models::BaseImage.where.delete
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/baseImages", '{"name":"ubuntu", "version":"1.0.0", "baseImage":"base","provision":"shell","provisionVersion":"1"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["date"]).to eq(nil)
            expect(response["provision"]).to eq("shell")
            expect(response["provisionVersion"]).to eq("1")
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/3")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/3")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/3")
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
            
            Dockmaster::Models::BaseImage.where.delete
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/baseImages", '{"name":"ubuntu", "version":"1.0.0", "baseImage":"base"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["date"]).to eq(nil)
            expect(response["provision"]).to eq(nil)
            expect(response["provisionVersion"]).to eq(nil)
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
            expect(response["elements"][0]["provision"]).to eq(nil)
            expect(response["elements"][0]["provisionVersion"]).to eq(nil)
            expect(response["size"]).to eq(1)
            
        end
        
    end
    
    context "delete baseImage" do
        
        it "no baseImage to delete available" do
            
            Dockmaster::Models::BaseImage.where.delete
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/baseImages/0"
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "delete existing baseImage" do
            
            Dockmaster::Models::BaseImage.where.delete
            baseImage = Dockmaster::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
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
            
            Dockmaster::Models::BaseImage.where.delete
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/baseImages/0", '{"provisioning":"shell"}'
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "update existing baseImage" do
            
            Dockmaster::Models::BaseImage.where.delete
            baseImage = Dockmaster::Models::BaseImage.new :name => "ubuntu", :version => "1.0.0", :baseImage => "base"
            baseImage.save
            
            get "/baseImages"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/baseImages/#{id}", '{"provision":"shell"}'
            
            expect(last_response.status).to eq(200)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("ubuntu")
            expect(response["baseImage"]).to eq("base")
            expect(response["version"]).to eq("1.0.0")
            expect(response["date"]).to eq(nil)
            expect(response["provision"]).to eq("shell")
            expect(response["provisionVersion"]).to eq(nil)
            expect(response["_links"]["self"]["href"]).to eq("/baseImages/6")
            expect(response["_links"]["delete"]["href"]).to eq("/baseImages/6")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/baseImages/6")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
end

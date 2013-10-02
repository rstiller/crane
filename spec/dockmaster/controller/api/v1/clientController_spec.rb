
require "rspec"
require "rack/test"
require "sequel"
require "json"

describe 'ClientControllerTest' do
    
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
    
    context "all clients" do
        
        it "no clients available" do
            
            Dockmaster::Models::Client.where.delete
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            expect(response["_links"]["self"]["href"]).to eq("/clients")
            expect(response["_links"]["new"]["href"]).to eq("/clients")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clients/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clients/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clients/{id}")
            
        end
        
        it "one client available" do
            
            Dockmaster::Models::Client.where.delete
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => "4243"
            client.save
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["elements"][0]["dockerPort"]).to eq(4243)
            expect(response["elements"][0]["_links"]["self"]["href"]).to eq("/clients/1")
            expect(response["elements"][0]["_links"]["delete"]["href"]).to eq("/clients/1")
            expect(response["elements"][0]["_links"]["delete"]["method"]).to eq("delete")
            expect(response["elements"][0]["_links"]["update"]["href"]).to eq("/clients/1")
            expect(response["elements"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clients")
            expect(response["_links"]["new"]["href"]).to eq("/clients")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clients/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clients/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clients/{id}")
            
        end
        
    end
    
    context "single client" do
        
        it "no clients available" do
            
            Dockmaster::Models::Client.where.delete
            
            get "/clients/0"
            
            expect(last_response).not_to be_ok
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "get a single client" do
            
            Dockmaster::Models::Client.where.delete
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => "4243"
            client.save
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            get "/clients/#{id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["address"]).to eq("192.168.1.1")
            expect(response["dockerVersion"]).to eq("0.6.3")
            expect(response["dockerPort"]).to eq(4243)
            expect(response["_links"]["self"]["href"]).to eq("/clients/#{id}")
            expect(response["_links"]["delete"]["href"]).to eq("/clients/#{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clients/#{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
    context "new single client" do
        
        it "new client full data-set" do
            
            Dockmaster::Models::Client.where.delete
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clients", '{"address":"192.168.1.1", "dockerVersion":"0.6.3", "dockerPort":"4243"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["address"]).to eq("192.168.1.1")
            expect(response["dockerVersion"]).to eq("0.6.3")
            expect(response["dockerPort"]).to eq(4243)
            expect(response["_links"]["self"]["href"]).to eq("/clients/3")
            expect(response["_links"]["delete"]["href"]).to eq("/clients/3")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clients/3")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/clients")
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["elements"][0]["dockerPort"]).to eq(4243)
            expect(response["size"]).to eq(1)
            
        end
        
        it "new client partial data-set" do
            
            Dockmaster::Models::Client.where.delete
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clients", '{"address":"192.168.1.1", "dockerPort":"4243"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["address"]).to eq("192.168.1.1")
            expect(response["dockerVersion"]).to eq(nil)
            expect(response["dockerPort"]).to eq(4243)
            expect(response["_links"]["self"]["href"]).to eq("/clients/4")
            expect(response["_links"]["delete"]["href"]).to eq("/clients/4")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clients/4")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/clients")
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["dockerVersion"]).to eq(nil)
            expect(response["elements"][0]["dockerPort"]).to eq(4243)
            expect(response["size"]).to eq(1)
            
        end
        
    end
    
    context "delete client" do
        
        it "no client to delete available" do
            
            Dockmaster::Models::Client.where.delete
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clients/0"
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "delete existing client" do
            
            Dockmaster::Models::Client.where.delete
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => "4243"
            client.save
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clients/#{id}"
            
            expect(last_response.status).to eq(204)
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(0)
            
        end
        
    end
    
    context "update client" do
        
        it "no client to update available" do
            
            Dockmaster::Models::Client.where.delete
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/clients/0", '{"dockerVersion":"0.6.0"}'
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "update existing client" do
            
            Dockmaster::Models::Client.where.delete
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => "4243"
            client.save
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/clients/#{id}", '{"dockerVersion":"0.6.0"}'
            
            expect(last_response.status).to eq(200)
            
            response = JSON.parse last_response.body
            expect(response["address"]).to eq("192.168.1.1")
            expect(response["dockerVersion"]).to eq("0.6.0")
            expect(response["dockerPort"]).to eq(4243)
            expect(response["_links"]["self"]["href"]).to eq("/clients/6")
            expect(response["_links"]["delete"]["href"]).to eq("/clients/6")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clients/6")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
end

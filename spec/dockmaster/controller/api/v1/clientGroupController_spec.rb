
require "rspec"
require "rack/test"
require "sequel"
require "json"

describe 'ClientGroupControllerTest' do
    
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
    
    before(:each) do
        @database = Sequel.sqlite(Settings["db.path"], :max_connections => 20)
    end
    
    after(:each) do
        unless @database.nil?
            @database.disconnect
        end
    end
    
    context "all groups" do
        
        it "no groups available" do
            
            Dockmaster::Models::ClientGroup.where.delete
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
        it "one group available" do
            
            Dockmaster::Models::ClientGroup.where.delete
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["_links"]["self"]["href"]).to eq("/clientGroups/1")
            expect(response["elements"][0]["_links"]["delete"]["href"]).to eq("/clientGroups/1")
            expect(response["elements"][0]["_links"]["delete"]["method"]).to eq("delete")
            expect(response["elements"][0]["_links"]["update"]["href"]).to eq("/clientGroups/1")
            expect(response["elements"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
        it "one group with client" do
            
            Dockmaster::Models::ClientGroup.where.delete
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            group.add_client client
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["clients"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["elements"][0]["clients"][0]["dockerPort"]).to eq(4243)
            
            id = response["elements"][0]["clients"][0]["id"]
            expect(response["elements"][0]["clients"][0]["_links"]["self"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["method"]).to eq("delete")
                
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
    end
    
    context "single group" do
        
        it "no groups available" do
            
            Dockmaster::Models::ClientGroup.where.delete
            
            get "/clientGroups/0"
            
            expect(last_response).not_to be_ok
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "get a single group" do
            
            Dockmaster::Models::ClientGroup.where.delete
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            group.add_client client
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            get "/clientGroups/#{id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("group1")
            expect(response["description"]).to eq("desc")
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups/#{id}")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/#{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/#{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
        it "get a single group with client" do
            
            Dockmaster::Models::ClientGroup.where.delete
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            group.add_client client
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            get "/clientGroups/#{id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("group1")
            expect(response["description"]).to eq("desc")
            expect(response["clients"][0]["address"]).to eq("192.168.1.1")
            expect(response["clients"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["clients"][0]["dockerPort"]).to eq(4243)
            
            clientId = response["clients"][0]["id"]
            expect(response["clients"][0]["_links"]["self"]["href"]).to eq("/clients/#{clientId}")
            expect(response["clients"][0]["_links"]["update"]["href"]).to eq("/clients/#{clientId}")
            expect(response["clients"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["clients"][0]["_links"]["delete"]["href"]).to eq("/clients/#{clientId}")
            expect(response["clients"][0]["_links"]["delete"]["method"]).to eq("delete")
                
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups/#{id}")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/#{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/#{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
    context "new single group" do
        
        it "new group full data-set" do
            
            Dockmaster::Models::ClientGroup.where.delete
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups", '{"name":"group1", "description":"desc"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("group1")
            expect(response["description"]).to eq("desc")
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups/5")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/5")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/5")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/clientGroups")
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["size"]).to eq(1)
            
        end
        
        it "new group partial data-set" do
            
            Dockmaster::Models::ClientGroup.where.delete
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups", '{"name":"group1"}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("group1")
            expect(response["description"]).to eq(nil)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups/6")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/6")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/6")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/clientGroups")
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq(nil)
            expect(response["size"]).to eq(1)
            
        end
        
        it "new group with not existing client" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups", '{"name":"group1","clients":[0]}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("group1")
            expect(response["description"]).to eq(nil)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups/7")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/7")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/7")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/clientGroups")
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq(nil)
            expect(response["size"]).to eq(1)
            
        end
        
        it "new group with existing client" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            client.save
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups", "{\"name\":\"group1\",\"clients\":[#{client.id}]}"
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("group1")
            expect(response["description"]).to eq(nil)
            
            expect(response["clients"][0]["address"]).to eq("192.168.1.1")
            expect(response["clients"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["clients"][0]["dockerPort"]).to eq(4243)
            
            expect(response["clients"][0]["_links"]["self"]["href"]).to eq("/clients/#{client.id}")
            expect(response["clients"][0]["_links"]["update"]["href"]).to eq("/clients/#{client.id}")
            expect(response["clients"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["clients"][0]["_links"]["delete"]["href"]).to eq("/clients/#{client.id}")
            expect(response["clients"][0]["_links"]["delete"]["method"]).to eq("delete")
            
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups/8")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/8")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/8")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/clientGroups")
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq(nil)
            expect(response["size"]).to eq(1)
            
        end
        
    end
    
    context "delete group" do
        
        it "no group to delete available" do
            
            Dockmaster::Models::ClientGroup.where.delete
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clientGroups/0"
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "delete existing group" do
            
            Dockmaster::Models::ClientGroup.where.delete
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clientGroups/#{id}"
            
            expect(last_response.status).to eq(204)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(0)
            
        end
        
        it "delete existing group with clients" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            group.add_client client
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clientGroups/#{id}"
            
            expect(last_response.status).to eq(204)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(0)
            
            expect(Dockmaster::Models::Client.all.size).to eq(1)
            
        end
        
    end
    
    context "update group" do
        
        it "no group to update available" do
            
            Dockmaster::Models::ClientGroup.where.delete
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/clientGroups/0", '{"description":"updated"}'
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "update existing group" do
            
            Dockmaster::Models::ClientGroup.where.delete
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/clientGroups/#{id}", '{"description":"updated"}'
            
            expect(last_response.status).to eq(200)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("group1")
            expect(response["description"]).to eq("updated")
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups/11")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/11")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/11")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
    context "relations" do
        
        it "add client" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            groupId = group.id
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            client.save
            clientId = client.id
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups/#{groupId}/clients/#{clientId}", ''
            
            expect(last_response.status).to eq(201)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["clients"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["elements"][0]["clients"][0]["dockerPort"]).to eq(4243)
            
            id = response["elements"][0]["clients"][0]["id"]
            expect(response["elements"][0]["clients"][0]["_links"]["self"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["method"]).to eq("delete")
                
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
        it "add client again" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            groupId = group.id
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            client.save
            clientId = client.id
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups/#{groupId}/clients/#{clientId}", ''
            
            expect(last_response.status).to eq(201)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["clients"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["elements"][0]["clients"][0]["dockerPort"]).to eq(4243)
            
            id = response["elements"][0]["clients"][0]["id"]
            expect(response["elements"][0]["clients"][0]["_links"]["self"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["method"]).to eq("delete")
                
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups/#{groupId}/clients/#{clientId}", ''
            
            expect(last_response.status).to eq(201)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["clients"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["elements"][0]["clients"][0]["dockerPort"]).to eq(4243)
            
            id = response["elements"][0]["clients"][0]["id"]
            expect(response["elements"][0]["clients"][0]["_links"]["self"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["method"]).to eq("delete")
                
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
        it "add not existing client" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            groupId = group.id
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            client.save
            clientId = client.id
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups/#{groupId}/clients/#{clientId + 1}", ''
            
            expect(last_response.status).to eq(404)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
        it "remove not existing client" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            groupId = group.id
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            client.save
            clientId = client.id
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clientGroups/#{groupId}/clients/#{clientId + 1}"
            
            expect(last_response.status).to eq(404)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
        it "remove not assigned client" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            groupId = group.id
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            client.save
            clientId = client.id
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clientGroups/#{groupId}/clients/#{clientId}"
            
            expect(last_response.status).to eq(204)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
        it "remove client" do
            
            Dockmaster::Models::Client.where.delete
            Dockmaster::Models::ClientGroup.where.delete
            
            group = Dockmaster::Models::ClientGroup.new :name => "group1", :description => "desc"
            group.save
            groupId = group.id
            
            client = Dockmaster::Models::Client.new :address => "192.168.1.1", :dockerVersion => "0.6.3", :dockerPort => 4243
            client.save
            clientId = client.id
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/clientGroups/#{groupId}/clients/#{clientId}", ''
            
            expect(last_response.status).to eq(201)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"][0]["address"]).to eq("192.168.1.1")
            expect(response["elements"][0]["clients"][0]["dockerVersion"]).to eq("0.6.3")
            expect(response["elements"][0]["clients"][0]["dockerPort"]).to eq(4243)
            
            id = response["elements"][0]["clients"][0]["id"]
            expect(response["elements"][0]["clients"][0]["_links"]["self"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["href"]).to eq("/clients/#{id}")
            expect(response["elements"][0]["clients"][0]["_links"]["delete"]["method"]).to eq("delete")
                
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/clientGroups/#{groupId}/clients/#{clientId}"
            
            expect(last_response.status).to eq(204)
            
            get "/clientGroups"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("group1")
            expect(response["elements"][0]["description"]).to eq("desc")
            expect(response["elements"][0]["clients"].length).to eq(0)
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["href"]).to eq("/clientGroups")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/clientGroups/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/clientGroups/{id}")
            
        end
        
    end
    
end

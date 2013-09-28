
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
    
    context "clients" do
        
        it "no clients available" do
            
            Dockmaster::Models::Client.where.delete
            
            get "/clients"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
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
            expect(response["size"]).to eq(1)
            
        end
        
    end
    
end

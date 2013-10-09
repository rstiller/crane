
require "rspec"
require "rack/test"
require "sequel"
require "json"

describe 'VersionControllerTest' do
    
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
    
    context "request with different version headers" do
        
        it "no version header" do
            
            header "Content-Type", nil
            get "/version"
            
            expect(last_response).to be_ok
            expect(last_response.body).to eq("1.0.0")
            expect(last_response.headers["Content-Type"]).to eq("application/vnd.crane.v1-0-0+text")
            
        end
        
        it "version 1.0.0 header" do
            
            header "Content-Type", "application/vnd.crane.v1-0-0+json"
            get "/version"
            
            expect(last_response).to be_ok
            expect(last_response.body).to eq("1.0.0")
            expect(last_response.headers["Content-Type"]).to eq("application/vnd.crane.v1-0-0+text")
            
        end
        
        it "version 2.0.0 header" do
            
            header "Content-Type", "application/vnd.crane.v2-0-0+json"
            get "/version"
            
            expect(last_response).to be_ok
            expect(last_response.body).to eq("2.0.0")
            expect(last_response.headers["Content-Type"]).to eq("application/vnd.crane.v2-0-0+text")
            
        end
        
#        it "unknown version header" do
#            
#            header "Content-Type", "application/vnd.crane.v1-1-0+json"
#            get "/version"
#            
#            expect(last_response).not_to be_ok
#            expect(last_response.status).to eq(415)
#            
#        end
        
    end
    
end

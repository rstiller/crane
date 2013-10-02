
require "rspec"
require "rack/test"
require "sequel"
require "json"

describe 'ProjectControllerTest' do
    
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
    
    context "all projects" do
        
        it "no projects available" do
            
            Dockmaster::Models::Project.where.delete
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            expect(response["_links"]["self"]["href"]).to eq("/projects")
            expect(response["_links"]["new"]["href"]).to eq("/projects")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/projects/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/projects/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/projects/{id}")
            
        end
        
        it "one project available" do
            
            Dockmaster::Models::Project.where.delete
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("project1")
            expect(response["elements"][0]["url"]).to eq("https://github.com/user/repo")
            expect(response["elements"][0]["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["elements"][0]["_links"]["self"]["href"]).to eq("/projects/1")
            expect(response["elements"][0]["_links"]["delete"]["href"]).to eq("/projects/1")
            expect(response["elements"][0]["_links"]["delete"]["method"]).to eq("delete")
            expect(response["elements"][0]["_links"]["update"]["href"]).to eq("/projects/1")
            expect(response["elements"][0]["_links"]["update"]["method"]).to eq("put")
            expect(response["size"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/projects")
            expect(response["_links"]["new"]["href"]).to eq("/projects")
            expect(response["_links"]["new"]["method"]).to eq("post")
            expect(response["_links"]["update"]["href"]).to eq("/projects/{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["delete"]["href"]).to eq("/projects/{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["single"]["href"]).to eq("/projects/{id}")
            
        end
        
    end
    
    context "single project" do
        
        it "no projects available" do
            
            Dockmaster::Models::Project.where.delete
            
            get "/projects/0"
            
            expect(last_response).not_to be_ok
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "get a single project" do
            
            Dockmaster::Models::Project.where.delete
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            get "/projects/#{id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["_links"]["self"]["href"]).to eq("/projects/#{id}")
            expect(response["_links"]["delete"]["href"]).to eq("/projects/#{id}")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/projects/#{id}")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
    context "new single project" do
        
        it "new project full data-set" do
            
            Dockmaster::Models::Project.where.delete
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/projects", '{"name":"project1", "url":"https://github.com/user/repo", "buildTags":1}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/projects/3")
            expect(response["_links"]["delete"]["href"]).to eq("/projects/3")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/projects/3")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/projects")
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("project1")
            expect(response["elements"][0]["url"]).to eq("https://github.com/user/repo")
            expect(response["elements"][0]["buildTags"]).to eq(1)
            expect(response["size"]).to eq(1)
            
        end
        
        it "new project partial data-set" do
            
            Dockmaster::Models::Project.where.delete
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/projects", '{"name":"project1", "buildTags":1}'
            
            expect(last_response.status).to eq(201)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq(nil)
            expect(response["buildTags"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/projects/4")
            expect(response["_links"]["delete"]["href"]).to eq("/projects/4")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/projects/4")
            expect(response["_links"]["update"]["method"]).to eq("put")
            expect(response["_links"]["all"]["href"]).to eq("/projects")
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["name"]).to eq("project1")
            expect(response["elements"][0]["url"]).to eq(nil)
            expect(response["elements"][0]["buildTags"]).to eq(1)
            expect(response["size"]).to eq(1)
            
        end
        
    end
    
    context "delete project" do
        
        it "no project to delete available" do
            
            Dockmaster::Models::Project.where.delete
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/projects/0"
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "delete existing project" do
            
            Dockmaster::Models::Project.where.delete
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/projects/#{id}"
            
            expect(last_response.status).to eq(204)
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(0)
            
        end
        
    end
    
    context "update project" do
        
        it "no project to update available" do
            
            Dockmaster::Models::Project.where.delete
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(0)
            expect(response["size"]).to eq(0)
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/projects/0", '{"name":"project2"}'
            
            expect(last_response.status).to eq(404)
            
        end
        
        it "update existing project" do
            
            Dockmaster::Models::Project.where.delete
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            get "/projects"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            expect(response["elements"].length).to eq(1)
            
            id = response["elements"][0]["id"]
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            put "/projects/#{id}", '{"url":"https://github.com/user/other-repo"}'
            
            expect(last_response.status).to eq(200)
            
            response = JSON.parse last_response.body
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/other-repo")
            expect(response["buildTags"]).to eq(1)
            expect(response["_links"]["self"]["href"]).to eq("/projects/6")
            expect(response["_links"]["delete"]["href"]).to eq("/projects/6")
            expect(response["_links"]["delete"]["method"]).to eq("delete")
            expect(response["_links"]["update"]["href"]).to eq("/projects/6")
            expect(response["_links"]["update"]["method"]).to eq("put")
            
        end
        
    end
    
end

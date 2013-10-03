
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
    
    context "project run configs" do
        
        it "no working copy" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(0)
            expect(response["tags"].length).to eq(0)
            
        end
        
        it "with working copy" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(0)
            
        end
        
        it "working copy with run config" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            
            runConfig = Dockmaster::Models::RunConfig.new :serviceName => "my_app", :environment => "test", :command => "docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service"
            workingCopy.add_runConfig runConfig
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(1)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("test")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service")
            
        end
        
        it "add a run config" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            projectId = project.id
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            workingCopyId = workingCopy.id
            
            runConfig = Dockmaster::Models::RunConfig.new :serviceName => "my_app", :environment => "test", :command => "docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service"
            workingCopy.add_runConfig runConfig
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(1)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("test")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/projects/#{projectId}/trees/#{workingCopyId}/configs",
                '{"serviceName":"my_app", "environment":"production", "command":"docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service --profile=production"}'
            
            expect(last_response.status).to be(201)
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(2)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("test")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service")
            expect(response["branches"][0]["runConfigs"][1]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][1]["environment"]).to eq("production")
            expect(response["branches"][0]["runConfigs"][1]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service --profile=production")
            
        end
        
        it "add a run config again" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            projectId = project.id
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            workingCopyId = workingCopy.id
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/projects/#{projectId}/trees/#{workingCopyId}/configs",
                '{"serviceName":"my_app", "environment":"production", "command":"docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service --profile=production"}'
            
            expect(last_response.status).to be(201)
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(1)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("production")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service --profile=production")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            post "/projects/#{projectId}/trees/#{workingCopyId}/configs",
                '{"serviceName":"my_app", "environment":"production", "command":"docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service --profile=production"}'
            
            expect(last_response.status).to be(409)
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(1)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("production")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service --profile=production")
            
        end
        
        it "delete not existing run config" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            projectId = project.id
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            workingCopyId = workingCopy.id
            
            runConfig = Dockmaster::Models::RunConfig.new :serviceName => "my_app", :environment => "test", :command => "docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service"
            workingCopy.add_runConfig runConfig
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(1)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("test")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/projects/#{projectId}/trees/#{workingCopyId}/configs/production/my_app"
            
            expect(last_response.status).to be(404)
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(1)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("test")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service")
            
        end
        
        it "delete run config" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            projectId = project.id
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            workingCopyId = workingCopy.id
            
            runConfig = Dockmaster::Models::RunConfig.new :serviceName => "my_app", :environment => "test", :command => "docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service"
            workingCopy.add_runConfig runConfig
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(1)
            expect(response["branches"][0]["runConfigs"][0]["serviceName"]).to eq("my_app")
            expect(response["branches"][0]["runConfigs"][0]["environment"]).to eq("test")
            expect(response["branches"][0]["runConfigs"][0]["command"]).to eq("docker run -d -t my_project-master/my_app-test /opt/my_app/bin/service")
            
            header "Content-Type", "application/vnd.dockmaster.v1-0-0+json"
            delete "/projects/#{projectId}/trees/#{workingCopyId}/configs/test/my_app"
            
            expect(last_response.status).to be(204)
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["runConfigs"].length).to eq(0)
            
        end
        
    end
    
    context "project build histories" do
        
        it "no build histories" do
            
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["buildHistories"].length).to eq(0)
            
        end
        
        it "one build history" do
            
            Dockmaster::Models::BuildHistory.where.delete
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            projectId = project.id
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            workingCopyId = workingCopy.id
            
            buildHistory = Dockmaster::Models::BuildHistory.new :date => Time.now, :ref => "ref", :successful => Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL
            workingCopy.add_buildHistory buildHistory
            buildHistoryId = buildHistory.id
            
            buildOutput = Dockmaster::Models::BuildOutput.new :serviceName => "my_app", :environment => "test", :output => "build log"
            buildHistory.add_buildOutput buildOutput
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["buildHistories"].length).to eq(1)
            expect(response["branches"][0]["buildHistories"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["buildHistories"][0]["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["branches"][0]["buildHistories"][0]["output"]["test"]["my_app"]["output"]).to eq("build log")
            
            get "/projects/#{projectId}/trees/#{workingCopyId}/histories"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(1)
            expect(response["elements"][0]["ref"]).to eq("ref")
            expect(response["elements"][0]["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["elements"][0]["output"]["test"]["my_app"]["output"]).to eq("build log")
            expect(response["size"]).to eq(1)
            
            get "/projects/#{projectId}/trees/#{workingCopyId}/histories/#{buildHistoryId}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["ref"]).to eq("ref")
            expect(response["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["output"]["test"]["my_app"]["output"]).to eq("build log")
            
        end
        
        it "multiple build histories" do
            
            Dockmaster::Models::BuildHistory.where.delete
            Dockmaster::Models::WorkingCopy.where.delete
            Dockmaster::Models::Project.where.delete
            
            project = Dockmaster::Models::Project.new :name => "project1", :url => "https://github.com/user/repo", :buildTags => Dockmaster::Models::Project::BUILD_TAGS
            project.save
            projectId = project.id
            
            workingCopy = Dockmaster::Models::WorkingCopy.new :name => "master", :ref => "ref", :type => Dockmaster::Models::WorkingCopy::BRANCH
            project.add_workingCopy workingCopy
            workingCopyId = workingCopy.id
            
            buildHistory = Dockmaster::Models::BuildHistory.new :date => Time.now, :ref => "ref1", :successful => Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL
            workingCopy.add_buildHistory buildHistory
            buildHistoryId1 = buildHistory.id
            
            buildOutput = Dockmaster::Models::BuildOutput.new :serviceName => "my_app", :environment => "test", :output => "build log my_app 1"
            buildHistory.add_buildOutput buildOutput
            
            buildOutput = Dockmaster::Models::BuildOutput.new :serviceName => "mongodb", :environment => "test", :output => "build log mongodb 1"
            buildHistory.add_buildOutput buildOutput
            
            buildHistory = Dockmaster::Models::BuildHistory.new :date => Time.now, :ref => "ref2", :successful => Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL
            workingCopy.add_buildHistory buildHistory
            buildHistoryId2 = buildHistory.id
            
            buildOutput = Dockmaster::Models::BuildOutput.new :serviceName => "my_app", :environment => "test", :output => "build log my_app 2"
            buildHistory.add_buildOutput buildOutput
            
            buildOutput = Dockmaster::Models::BuildOutput.new :serviceName => "mongodb", :environment => "test", :output => "build log mongodb 2"
            buildHistory.add_buildOutput buildOutput
            
            get "/projects/#{project.id}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["name"]).to eq("project1")
            expect(response["url"]).to eq("https://github.com/user/repo")
            expect(response["buildTags"]).to eq(Dockmaster::Models::Project::BUILD_TAGS)
            expect(response["branches"].length).to eq(1)
            expect(response["branches"][0]["name"]).to eq("master")
            expect(response["branches"][0]["ref"]).to eq("ref")
            expect(response["branches"][0]["type"]).to eq("branch")
            expect(response["branches"][0]["_links"]["addConfig"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/configs")
            expect(response["branches"][0]["_links"]["addConfig"]["method"]).to eq("post")
            expect(response["branches"][0]["_links"]["removeConfig"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/configs/{environment}/{serviceName}")
            expect(response["branches"][0]["_links"]["removeConfig"]["method"]).to eq("delete")
            expect(response["branches"][0]["_links"]["removeConfig"]["templated"]).to eq(true)
            expect(response["branches"][0]["_links"]["histories"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories")
            expect(response["branches"][0]["_links"]["history"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories/{history}")
            expect(response["branches"][0]["_links"]["history"]["templated"]).to eq(true)
            expect(response["branches"][0]["buildHistories"].length).to eq(2)
            expect(response["branches"][0]["buildHistories"][0]["ref"]).to eq("ref1")
            expect(response["branches"][0]["buildHistories"][0]["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["branches"][0]["buildHistories"][0]["output"]["test"]["my_app"]["output"]).to eq("build log my_app 1")
            expect(response["branches"][0]["buildHistories"][0]["output"]["test"]["mongodb"]["output"]).to eq("build log mongodb 1")
            expect(response["branches"][0]["buildHistories"][0]["_links"]["self"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories/#{buildHistoryId1}")
            expect(response["branches"][0]["buildHistories"][0]["_links"]["all"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories")
            expect(response["branches"][0]["buildHistories"][1]["ref"]).to eq("ref2")
            expect(response["branches"][0]["buildHistories"][1]["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["branches"][0]["buildHistories"][1]["output"]["test"]["my_app"]["output"]).to eq("build log my_app 2")
            expect(response["branches"][0]["buildHistories"][1]["output"]["test"]["mongodb"]["output"]).to eq("build log mongodb 2")
            expect(response["branches"][0]["buildHistories"][1]["_links"]["self"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories/#{buildHistoryId2}")
            expect(response["branches"][0]["buildHistories"][1]["_links"]["all"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories")
            
            get "/projects/#{projectId}/trees/#{workingCopyId}/histories"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["elements"].length).to eq(2)
            expect(response["elements"][0]["ref"]).to eq("ref1")
            expect(response["elements"][0]["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["elements"][0]["output"]["test"]["my_app"]["output"]).to eq("build log my_app 1")
            expect(response["elements"][0]["output"]["test"]["mongodb"]["output"]).to eq("build log mongodb 1")
            expect(response["elements"][0]["_links"]["self"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories/#{buildHistoryId1}")
            expect(response["elements"][0]["_links"]["all"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories")
            expect(response["elements"][1]["ref"]).to eq("ref2")
            expect(response["elements"][1]["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["elements"][1]["output"]["test"]["my_app"]["output"]).to eq("build log my_app 2")
            expect(response["elements"][1]["output"]["test"]["mongodb"]["output"]).to eq("build log mongodb 2")
            expect(response["elements"][1]["_links"]["self"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories/#{buildHistoryId2}")
            expect(response["elements"][1]["_links"]["all"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories")
            expect(response["size"]).to eq(2)
            
            get "/projects/#{projectId}/trees/#{workingCopyId}/histories/#{buildHistoryId1}"
            
            expect(last_response).to be_ok
            
            response = JSON.parse last_response.body
            
            expect(response["ref"]).to eq("ref1")
            expect(response["successful"]).to eq(Dockmaster::Models::BuildHistory::BUILD_SUCCESSFUL)
            expect(response["output"]["test"]["my_app"]["output"]).to eq("build log my_app 1")
            expect(response["output"]["test"]["mongodb"]["output"]).to eq("build log mongodb 1")
            expect(response["_links"]["self"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories/#{buildHistoryId1}")
            expect(response["_links"]["all"]["href"]).to eq("/projects/#{projectId}/trees/#{workingCopyId}/histories")
            
        end
        
    end
    
end

require "rubygems"
require "./lib/dockmaster"
require "./lib/dockmaster/controller/api/api"

use Dockmaster::App

map "/api" do
    run Dockmaster::Controller::Api
end

require "rubygems"
require "./lib/crane"
require "./lib/crane/controller/api/api"
require "./lib/crane/controller/files/files"

use Crane::App

map "/api" do
    run Crane::Controller::Api
end

map "/" do
    run Crane::Controller::Files
end

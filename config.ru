require "rubygems"
require "./lib/crane"
require "./lib/crane/controller/api/api"

use Crane::App

map "/api" do
    run Crane::Controller::Api
end

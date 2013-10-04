
require "configliere"

module Crane
    
    Settings.read "./config/defaults.yml"
    Settings.read "/etc/crane/config.yml"
    Settings.resolve!
    
end

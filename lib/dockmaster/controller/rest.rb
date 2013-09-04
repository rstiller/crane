
require 'sinatra'

module Dockmaster
    
    class Rest < Sinatra::Base
        
        configure :production, :development do
            enable :logging
        end
        
        get '/' do
            'Hello World'
        end
        
    end

end

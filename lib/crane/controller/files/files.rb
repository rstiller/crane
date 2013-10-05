
require "sinatra/base"

module Crane
    
    module Controller
        
        class Files < Sinatra::Base
            
            set :public_folder, 'public'
            set :static_cache_control, [:public, :max_age => 60 * 60 * 24 * 365]
            
            get "/" do
                redirect '/index.html', 301
            end
            
        end
        
    end

end


require "thread"

module Dockmaster
    
    class ThreadPool
        
        def initialize(workerCount)
            @workerCount = workerCount
            
            @threads = []
            @jobs = Queue.new
            
            workerCount.times do
                
                @threads.push Thread.new {
                    
                    while true do
                        
                        job = @jobs.pop
                        
                        if job != nil
                            
                            job.call
                            
                        end
                        
                    end
                    
                }
                
            end
            
        end
        
        def workerCount
            @workerCount
        end
        
        def submit(job)
            
            @jobs.push job
            
        end
        
        def shutdown
            
            @threads.each do |thread|
                
                thread.stop
                
            end
            
        end
        
    end
    
end

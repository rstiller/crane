
require "dockmaster/util/threadpool"

describe "ThreadPool" do
    
    context "new" do
        
        it "no args" do
            
            expect {
                Dockmaster::ThreadPool.new
            }.to raise_error
            
        end
        
        it "new threadpool" do
            
            expect(Thread).to receive(:new)
            expect(Queue).to receive(:new)
            
            pool = Dockmaster::ThreadPool.new 1
            
            expect(pool.workerCount).to equal(1)
            
        end
        
    end
    
end

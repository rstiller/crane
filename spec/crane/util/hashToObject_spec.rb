
require "crane/util/hashToObject"

describe "HashToObject" do
    
    context "hashToObject" do
        
        it "simple" do
            
            hash = {
                "key1" => "value1",
                "key2" => "value2",
                "key3" => "value3",
            }
            
            Crane::hashToObject hash, hash
            
            expect(hash.key1).to eq("value1")
            expect(hash.key2).to eq("value2")
            expect(hash.key3).to eq("value3")
            
            hash.key1 = "value4"
            hash.key2 = "value5"
            hash.key3 = "value6"
            
            expect(hash.key1).to eq("value4")
            expect(hash.key2).to eq("value5")
            expect(hash.key3).to eq("value6")
            
        end
        
    end
    
end

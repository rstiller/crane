
require "system/getifaddrs"

module Dockmaster
    
    def self.getEthernetAddresses
        
        addresses = System.get_all_ifaddrs
        ethernetAddresses = []
        
        addresses.each do |address|
            
            if address[:interface].match /^eth/
                
                ethernetAddresses.push address[:inet_addr]
                
            end
            
        end
        
        ethernetAddresses
        
    end
    
end

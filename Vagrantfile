# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::configure("2") do |config|
    
    config.ssh.forward_agent
    
    config.vm.define :crane do |cfg|
        cfg.vm.network :forwarded_port, guest: 5984, host: 5984, auto_correct: true
        cfg.vm.network :forwarded_port, guest: 6984, host: 6984, auto_correct: true
        cfg.vm.network :forwarded_port, guest: 5000, host: 5000, auto_correct: true
        cfg.vm.network :forwarded_port, guest: 9000, host: 9000, auto_correct: true
        cfg.vm.provision :puppet do |puppet|
            puppet.module_path = [ "manifests" ]
        end
        cfg.vm.network "private_network", ip: "192.168.1.2"
    end
    
    config.vm.define :docker_client do |cfg|
        cfg.vm.network :forwarded_port, guest: 4243, host: 4243, auto_correct: true
        cfg.vm.provision :puppet do |puppet|
            puppet.module_path = [ "manifests" ]
            puppet.manifest_file = "docker_client.pp"
        end
        cfg.vm.network "private_network", ip: "192.168.1.3"
    end
    
    config.vm.provider :virtualbox do |v, override|
        override.vm.box = 'precise64'
        override.vm.box_url = 'http://files.vagrantup.com/precise64.box'
        v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
        v.customize ["modifyvm", :id, "--memory", 1024]
        v.customize ["modifyvm", :id, "--cpus", 8]
        v.customize ["modifyvm", :id, "--hwvirtex", "on"]
        v.customize ["modifyvm", :id, "--nestedpaging", "on"]
    end
    
    config.vm.provider :lxc do |v, override|
        override.vm.box = 'precise64'
        override.vm.box_url = 'http://dl.dropbox.com/u/13510779/lxc-raring-amd64-2013-07-12.box'
        v.customize 'cgroup.memory.limit_in_bytes', '256M'
    end
    
end

# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::configure("2") do |config|
    
    config.ssh.forward_agent
    
    config.vm.define :dockmaster do |cfg|
        cfg.vm.network :forwarded_port, guest: 4567, host: 8080, auto_correct: true
    end
    
    config.vm.provision :puppet do |puppet|
        #puppet.module_path = [ "modules" ]
        #puppet.options = "--verbose --debug"
    end
    
    config.vm.provider :virtualbox do |v, override|
        override.vm.box = 'precise64'
        override.vm.box_url = 'http://files.vagrantup.com/precise64.box'
        v.customize ["modifyvm", :id, "--memory", 256]
        v.customize ["modifyvm", :id, "--cpus", 1]
        v.customize ["modifyvm", :id, "--hwvirtex", "on"]
        v.customize ["modifyvm", :id, "--nestedpaging", "on"]
    end
    
    config.vm.provider :lxc do |v, override|
        override.vm.box = 'precise64'
        override.vm.box_url = 'http://dl.dropbox.com/u/13510779/lxc-precise-amd64-2013-05-08.box'
        v.customize 'cgroup.memory.limit_in_bytes', '256M'
    end
    
end

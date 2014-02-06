
Exec {
    path => [ '/usr/bin/', '/bin', '/usr/local/bin/', ],
}

exec { 'apt-get update':
    user => root,
} ->

package { [
    'g++',
    'lxc',
    'cgroup-lite',
    'redir',
    'python-pip',
    'python-software-properties',
    'curl',
    'htop',
    'git',
    'vim',
    'build-essential',
    ]:
    ensure => latest,
} ->

exec { 'docker_install':
    command => 'wget --output-document=docker https://get.docker.io/builds/Linux/x86_64/docker-latest && chmod +x /usr/bin/docker',
    cwd     => '/usr/bin',
    user    => root,
    creates => '/usr/bin/docker',
} ->

file { '/etc/init/docker-daemon.conf':
    source => "puppet:///modules/crane/docker_daemon.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
    notify => Service['docker-daemon'],
} ->

group { 'docker':
    ensure => present,
} ->

user { 'vagrant':
    ensure => present,
    groups => ['docker'],
} ->

service { 'docker-daemon':
    ensure => running,
}

file { '/etc/init/docker-registry.conf':
    source => "puppet:///modules/crane/docker_registry.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

file { '/var/crane':
    ensure => directory,
    owner  => root,
    group  => root,
} ->

file { '/var/crane/registry':
    ensure => directory,
    owner  => root,
    group  => root,
} ->

file { '/var/crane/registry/config.yml':
    source => "puppet:///modules/crane/registry.yml",
    owner  => root,
    group  => root,
} ->

exec { 'docker pull stackbrew/registry':
    user    => root,
    timeout => 0,
    require => Service["docker-daemon"],
}

exec { 'docker pull rstiller/couchdb':
    user    => root,
    timeout => 0,
    require => Service["docker-daemon"],
} ->

file { '/etc/init/couchdb.conf':
    source => "puppet:///modules/crane/couchdb.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

service { 'couchdb':
    ensure => running,
}

exec { 'apt-add-repository ppa:chris-lea/node.js && apt-get update':
    user    => root,
    creates => '/etc/apt/sources.list.d/chris-lea-node_js-precise.list',
    require => Package['python-software-properties'],
} ->

package { ['nodejs']:
} ->

exec { 'npm install -g grunt-cli bower karma':
    user    => root,
    creates => '/usr/bin/grunt',
} ->

exec { 'npm install --no-bin-links':
    cwd     => '/vagrant',
    creates => '/vagrant/node_modules',
} ->

exec { 'bower install --allow-root':
    cwd => '/vagrant',
}

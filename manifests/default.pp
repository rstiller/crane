
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
    'build-essential',
    'erlang-base-hipe',
    'erlang-dev',
    'erlang-manpages',
    'erlang-eunit',
    'erlang-nox',
    'erlang-xmerl',
    'erlang-inets',
    'libtool',
    'libcurl4-gnutls-dev',
    'libicu-dev',
    'libmozjs185-dev',
    'libmozjs-dev',
    'libcurl4-openssl-dev',
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

service { 'docker-daemon':
    ensure => running,
} ->

exec { 'git clone https://github.com/dotcloud/docker-registry.git /var/crane/registry':
    user    => root,
    creates => "/var/crane/registry",
} ->

file { '/etc/init/docker-registry.conf':
    source => "puppet:///modules/crane/docker_registry.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

file { '/var/crane/registry/config.yml':
    source => "puppet:///modules/crane/registry.yml",
    owner  => root,
    group  => root,
} ->

exec { 'pip install -r requirements.txt':
    cwd     => "/var/crane/registry/",
    user    => root,
    creates => "/var/crane/registry/wsgi.pyc",
} ->

service { 'docker-registry':
    ensure => running,
}

file { '/tmp/couchdb':
    ensure => directory,
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

file { '/tmp/couchdb/Dockerfile':
    source => "puppet:///modules/crane/couchdb/Dockerfile",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

exec { 'docker build -t="couchdb" .':
    user    => root,
    cwd     => '/tmp/couchdb',
    require => Service['docker-daemon'],
    timeout => 0,
} ->

file { '/etc/init/couchdb.upstart':
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

exec { 'npm install -g grunt-cli bower karma mocha':
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

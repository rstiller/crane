
Exec {
    path => [ '/usr/bin/', '/bin', '/usr/local/bin/', ],
}

exec { 'apt-get update':
    user => root,
} ->

package { [
    'g++',
    'ruby1.9.3',
    'make',
    'git',
    'sqlite3',
    'libsqlite3-ruby1.9.1',
    'libsqlite3-dev',
    'lxc',
    'cgroup-lite',
    'redir',
    'build-essential',
    'python-dev',
    'python-software-properties',
    'libevent-dev',
    'python-pip',
    'libxslt1-dev',
    'libxml2-dev',
    'curl',
    ]:
    ensure => latest,
} ->

package { ['bundler']:
    provider => gem,
    ensure   => latest,
} ->

exec { 'bundle install':
    cwd     => '/vagrant',
    user    => root,
} ->

exec { 'wget --output-document=docker https://get.docker.io/builds/Linux/x86_64/docker-latest && chmod +x /usr/bin/docker':
    cwd     => '/usr/bin',
    user    => root,
    creates => '/usr/bin/docker',
} ->

file { '/etc/init/docker-daemon.conf':
    source => "puppet:///modules/crane/docker_daemon.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
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

exec { 'apt-add-repository ppa:chris-lea/node.js && apt-get update':
    user    => root,
    creates => '/etc/apt/sources.list.d/chris-lea-node_js-precise.list',
    require => Package['python-software-properties'],
} ->

package { ['nodejs']:
} ->

exec { 'npm install -g grunt-cli bower':
    user    => root,
    creates => '/usr/bin/grunt',
} ->

exec { 'npm install --no-bin-links':
    cwd     => '/vagrant',
    creates => '/vagrant/node_modules',
}

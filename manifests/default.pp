
exec { 'apt-get update':
    user => root,
    path => [ '/usr/bin/' ],
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
    path    => [ '/usr/bin/', '/bin', '/usr/local/bin/', ],
} ->

exec { 'wget --output-document=docker https://get.docker.io/builds/Linux/x86_64/docker-latest && chmod +x /usr/bin/docker':
    cwd     => '/usr/bin',
    user    => root,
    path    => [ '/usr/bin/', '/bin' ],
    creates => '/usr/bin/docker',
} ->

file { '/etc/init/docker-daemon.conf':
    source => "puppet:///modules/dockmaster/docker_daemon.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

service { 'docker-daemon':
    ensure => running,
} ->

exec { 'git clone https://github.com/dotcloud/docker-registry.git /var/dockmaster/registry':
    user    => root,
    path    => [ '/usr/bin/', '/bin' ],
    creates => "/var/dockmaster/registry",
} ->

file { '/etc/init/docker-registry.conf':
    source => "puppet:///modules/dockmaster/docker_registry.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

file { '/var/dockmaster/registry/config.yml':
    source => "puppet:///modules/dockmaster/registry.yml",
    owner  => root,
    group  => root,
} ->

exec { 'pip install -r requirements.txt':
    cwd     => "/var/dockmaster/registry/",
    user    => root,
    path    => [ '/usr/bin/', '/bin' ],
    creates => "/var/dockmaster/registry/wsgi.pyc",
} ->

service { 'docker-registry':
    ensure => running,
}

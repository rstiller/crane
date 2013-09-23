
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

file { '/etc/init/docker.conf':
    source => "puppet:///modules/dockmaster/docker.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

service { 'docker':
    ensure => running,
} ->

exec { 'docker pull samalba/docker-registry':
    user    => root,
    path    => [ '/usr/bin/', ],
    timeout => 0,
} ->

file { '/var/dockmaster/registry.yml':
    source => "puppet:///modules/dockmaster/registry.yml",
    owner  => root,
    group  => root,
} ->

exec { 'docker run -d samalba/docker-registry && touch /var/lock/docker-registry.lock':
    environment => [ 'SETTINGS_FLAVOR=prod', 'DOCKER_REGISTRY_CONFIG=/var/dockmaster/registry.yml', ],
    user    => root,
    path    => [ '/usr/bin/', '/bin' ],
    creates => "/var/lock/docker-registry.lock",
}


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
#    'linux-image-extra-3.2.0-23-virtual',
#    'linux-image-3.8.0-30-generic',
#    'linux-headers-3.8.0-30-generic',
#    'linux-generic-lts-raring',
    ]:
    ensure => latest,
} ->

#package { ['virtualbox-guest-additions']:
#    ensure => latest,
#} ->

package { ['bundler']:
    provider => gem,
    ensure   => latest,
} ->

exec { 'wget --output-document=docker https://get.docker.io/builds/Linux/x86_64/docker-latest && chmod +x /usr/bin/docker':
    cwd     => '/usr/bin',
    user    => root,
    path    => [ '/usr/bin/', '/bin' ],
    creates => '/usr/bin/docker',
} ->

exec { 'bundle install':
    cwd     => '/vagrant',
    user    => root,
    path    => [ '/usr/bin/', '/bin', '/usr/local/bin/', ],
}

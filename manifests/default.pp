
exec { 'apt-get update':
    user => root,
    path => [ '/usr/bin/' ],
} ->

package { ['ruby1.9.3', 'make', 'git', 'sqlite3', 'libsqlite3-ruby1.9.1', 'lxc']:
    ensure => latest,
} ->

exec { 'wget --output-document=docker https://get.docker.io/builds/Linux/x86_64/docker-latest && chmod +x /usr/bin/docker':
    cwd     => '/usr/bin',
    user    => root,
    path    => [ '/usr/bin/', '/bin' ],
    creates => '/usr/bin/docker',
}

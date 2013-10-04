
exec { 'wget --output-document=docker https://get.docker.io/builds/Linux/x86_64/docker-latest && chmod +x /usr/bin/docker':
    cwd     => '/usr/bin',
    user    => root,
    path    => [ '/usr/bin/', '/bin' ],
    creates => '/usr/bin/docker',
} ->

file { '/etc/init/docker.conf':
    source => "puppet:///modules/crane/docker_client.upstart",
    owner  => root,
    group  => root,
    mode   => 0755,
} ->

service { 'docker':
    ensure => running,
}

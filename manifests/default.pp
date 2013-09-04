
exec { "apt-get update":
    user => root,
    path => [ "/usr/bin/" ],
} ->

package { ['ruby1.9.3', 'make', 'git', 'sqlite3']:
    ensure => latest,
}

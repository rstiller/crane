# Services

Services put together your application and are configured as follows:

```yaml
name: my_servcie
description: My Servcie description
version: 1.0.0
category: custom | database | webserver | proxy | management | statistic

base: ubuntu | debian
provision:
    provider: puppet | shell
    manifest: my_service/default.pp
    modulePaths:
        - my_service/modules
        - my_service/manifests

ports:
    - 8080

options:
    memory: 512m
```

The service definition file can be referenced in the infrastructure file as manifest.

## provisioning

#### puppet

```yaml
...
provision:
    provider: puppet
    manifest: my_service/default.pp # relative to this file
    facts:
        fact1: fact1.rb             # relative to this file
        fact2: fact2.rb
    modulePaths:
        - my_service/modules        # relative to this file
        - my_service/manifests      # relative to this file
...
```

#### shell

*Note:* to set environment variables use the infrastructures' environments block

```yaml
...
provision:
    provider: shell
    directories:
        provisioning/debian: /opt/share/provisioning/debian # provisioning/debian is relative to this file
        provisioning/ubuntu: /opt/share/provisioning/ubuntu # /opt/share/provisioning/ubuntu is the folder in the container
    path:
        - /bin
        - /usr/bin
        - /usr/share
    commands:
        - apt-get update
        - apt-get install -y --force-yes ruby1.9.1
        - gem install sinatra sequel
...
```

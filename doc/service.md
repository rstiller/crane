# Services

Services put together your application and are configured as follows:

```yaml
name: my_servcie
description: My Servcie description
version: 1.0.0
category: custom | database | webserver | proxy | management | statistic

base: ubuntu | debian
provision:
    provider: puppet | chef | bash | make
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

# Infrastructure.md

An infrastructure of a project consists of one or more [Services](service.md).

The idea is that you configure your projects' services in the infrastructure file and
let the Dockmaster take care of building the [docker](http://www.docker.io/) images.

Project orchestration in a git repository got some benefits:
- verbal, declarative infrastructure definition
- versioning of your entire application
- system / service documentation

The Dockamster builds the [docker](http://www.docker.io/) images of all services and bundels them
under the branch / tag name they are built from.

To define an infrastructure you need a git-repository with an ``infrastructure.(yml | json)``
file.

```yaml
services:
    mongodb:
        nodes: auto
        minNodes: 3
        maxNodes: 9
        manifest: mongodb.yml
    nginx:
        nodes: auto
        manifest: nginx.yml
    my_app:
        nodes: auto
        manifest: my_app.yml
    haproxy:
        nodes: 2
        manifest: https://raw.github.com/user/repo/master/haproxy.yml

environments:
    staging:
        env_var1: xyz1
    test:
        env_var1: xyz2
    development:
        env_var1: xyz3
    production:
        env_var1: xyz
    production_mirrowed:
        env_var1: xyz

```

- ``services`` - a list of service definition which represents your entire project
- ``environments`` - a list of environment-labels, which contain some environment variables
    that are used when building the [docker](http://www.docker.io/) images

After building the [docker](http://www.docker.io/) images for all services and environments,
the Dockmaster is able to deploy a certain version of your application to a couple of hosts.

E.g. after building the newest master-branch version you may want
to deploy version ``master/staging`` to your staging clients.

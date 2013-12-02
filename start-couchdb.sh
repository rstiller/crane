#!/bin/bash

docker run -name crane-couchdb -p 5984:5984 -p 6984:6984 -d rstiller/couchdb:1.5.0-ubuntu-12.10 /usr/local/bin/couchdb

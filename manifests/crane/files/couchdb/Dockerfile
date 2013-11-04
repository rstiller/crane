
FROM ubuntu
EXPOSE 5984:5984

RUN apt-get install -y help2man make gcc zlib1g-dev libssl-dev rake texinfo flex dctrl-tools libsctp-dev libxslt1-dev libcap2-bin ed git
RUN git clone git://github.com/iriscouch/build-couchdb --recursive
RUN cd build-couchdb && rake

CMD ["build-couchdb/build/bin/couchdb"]

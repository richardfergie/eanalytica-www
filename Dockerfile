FROM fpco/stack-build:lts-15.0
MAINTAINER Richard Fergie <richard.fergie@gmail.com>

RUN ln -fs /usr/share/zoneinfo/Europe/London /etc/localtime
RUN apt-get update && apt-get -qq -y install awscli

ADD stack.yaml stack.yaml
ADD eanalytica-www.cabal eanalytica-www.cabal

RUN stack setup
RUN stack build -j1 --fast  --only-dependencies

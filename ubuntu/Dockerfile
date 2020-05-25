FROM ubuntu:latest

RUN apt-get update

# installing an editor is not necessary, but is handy
RUN apt-get -y install nano
RUN apt-get -y install vim
RUN apt-get -y install emacs25-nox

# installing an netstat is not necessary, but is handy
RUN apt-get install net-tools

# openssl is the only required thing to install
RUN apt-get -y install openssl
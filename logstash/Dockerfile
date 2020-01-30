FROM docker.elastic.co/logstash/logstash:7.4.1
COPY postgresql-42.2.9.jar /usr/share/logstash/logstash-core/lib/jars/postgresql-42.2.9.jar
COPY jdbc.zip /usr/share/logstash/logstash-core/lib/jars/jdbc.zip
RUN /usr/share/logstash/bin/logstash-plugin install logstash-output-jdbc

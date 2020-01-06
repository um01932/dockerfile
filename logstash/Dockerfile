FROM docker.elastic.co/logstash/logstash:7.4.1
COPY ojdbc7.jar /usr/share/logstash/logstash-core/lib/jars/ojdbc7.jar
COPY mysql-connector-java-8.0.18.jar /usr/share/logstash/logstash-core/lib/jars/mysql-connector-java-8.0.18.jar
RUN /usr/share/logstash/bin/logstash-plugin install logstash-output-jdbc

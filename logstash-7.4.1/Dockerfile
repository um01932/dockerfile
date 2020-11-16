FROM docker.elastic.co/logstash/logstash:7.4.1
COPY logstash.yml /usr/share/logstash/config/
COPY ojdbc8.jar /usr/share/logstash/logstash-core/lib/jars/ojdbc8.jar
COPY postgresql-42.2.9.jar /usr/share/logstash/logstash-core/lib/jars/postgresql-42.2.9.jar
COPY jdbc.zip /usr/share/logstash/logstash-core/lib/jars/jdbc.zip
COPY mysql-connector-java-8.0.18.jar /usr/share/logstash/logstash-core/lib/jars/mysql-connector-java-8.0.18.jar
RUN /usr/share/logstash/bin/logstash-plugin install logstash-output-jdbc

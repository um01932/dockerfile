FROM httpd:2.4

COPY ./config/httpd.conf /usr/local/apache2/conf/httpd.conf

COPY ./lib/ /usr/local/apache2/htdocs/workplace-api/
COPY ./node_modules/es6-promise/dist/es6-promise.js /usr/local/apache2/htdocs/workplace-api/es6-promise.js
COPY ./sample/ /usr/local/apache2/htdocs

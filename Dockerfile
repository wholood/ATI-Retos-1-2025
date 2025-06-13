FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y apache2 python3 python3-pip git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Instalar Flask y Gunicorn (servidor WSGI para producción)
RUN pip3 install Flask gunicorn

RUN git clone --depth 1 https://github.com/wholood/ATI-Retos-1-2025.git /var/www/html/ATI-Retos-1-2025 

RUN cp -R /var/www/html/ATI-Retos-1-2025/* /var/www/html/ && \
    rm -rf /var/www/html/ATI-Retos-1-2025

RUN rm /etc/apache2/sites-enabled/000-default.conf

RUN cp /var/www/html/apache.conf /etc/apache2/sites-available/000-default.conf


RUN a2ensite 000-default.conf && \
    a2enmod proxy && \
    a2enmod proxy_http && \
    a2enmod rewrite


RUN chmod +x /var/www/html/start.sh

RUN a2enmod proxy proxy_http rewrite

EXPOSE 80

CMD ["/var/www/html/start.sh"]

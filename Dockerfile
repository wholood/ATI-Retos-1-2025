# Usar la imagen oficial de Ubuntu como base
FROM ubuntu:latest

# Actualizar paquetes e instalar Apache
RUN apt-get update && apt-get install -y apache2

# Copiar todos los archivos del proyecto al directorio de Apache
COPY ./ /var/www/html/

# Exponer el puerto 80 para acceder al servidor
EXPOSE 80

# Iniciar Apache cuando el contenedor se ejecute
CMD ["apachectl", "-D", "FOREGROUND"]

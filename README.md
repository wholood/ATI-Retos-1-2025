# ATI Retos 1-2025
 
# Proyecto personal

Este repositorio contiene todos los retos realizados en el proyecto personal de la materia. También permite crear un contenedor Docker basado en Ubuntu y Apache, copiando los archivos del proyecto y permitiendo la visualización de las páginas HTML desde el servidor dentro del contenedor.

## Visualización del proyecto

### Clonar el repositorio y Iniciar el contenedor
Verificar que Docker está instalado con:
```bash
docker -v
```
Si no está instalado, sigue la documentación oficial: https://docs.docker.com/get-docker/

Clona el repositorio del proyecto:
```bash
git clone https://github.com/wholood/ATI-Retos-1-2025
cd <NOMBRE_DEL_PROYECTO>
```

Ejecuta el siguiente comando en la raíz del proyecto para construir la imagen:

```bash
docker build -t mi-proyecto .
```
Este comando toma el Dockerfile y crea una imagen llamada mi-proyecto.

Para iniciar el contenedor y mapear el puerto 8080, usa:
```bash
docker run -tid --name mi-servidor -p 8080:80 mi-proyecto
```
### Acceder al contenedor y al servidor

Accede al contenedor
``` bash
docker exec -ti mi-servidor /bin/bash
```
Accede al servidor mediante el url: http://localhost:8080/

### Detener y eliminar el contenedor cuando no sea necesario
```bash
docker stop mi-servidor
docker rm mi-servidor
```

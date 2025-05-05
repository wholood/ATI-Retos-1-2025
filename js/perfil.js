document.addEventListener('DOMContentLoaded', function() {
    
    function getUrlParameter(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    
    const ciPerfil = getUrlParameter('ci');
    
    if (ciPerfil) {
        
        const perfilPath = `https://raw.githubusercontent.com/wholood/ATI-Retos-1-2025/reto-03/${ciPerfil}/perfil.json`;
        
        
        fetch(perfilPath)
            .then(response => response.text())
            .then(text => {
                
                const jsonString = text.replace(/^const perfil\s*=\s*/, '').replace(/;\s*$/, '');
                const perfil = JSON.parse(jsonString);
                
                // Actualizar el DOM con los datos del perfil
                document.getElementById('perfil-title').textContent = `Perfil de ${perfil.nombre}`;
                document.getElementById('perfil-name').textContent = perfil.nombre;
                document.getElementById('perfil-description').textContent = perfil.descripcion;
                document.getElementById('datos-color').textContent = `Color favorito: ${perfil.color}`;
                document.getElementById('datos-libro').textContent = `Libro favorito: ${perfil.libro.join(', ')}`;
                document.getElementById('datos-musica').textContent = `Música favorita: ${perfil.musica.join(', ')}`;
                document.getElementById('datos-videojuegos').textContent = `Videojuegos favoritos: ${perfil.video_juego.join(', ')}`;
                document.getElementById('datos-lenguaje').textContent = `Lenguajes conocidos: ${perfil.lenguajes.join(', ')}`;
                document.getElementById('perfil-email').textContent = `contacto`;
                document.getElementById('perfil-email-enlace').textContent = `${perfil.email}`;
                document.getElementById('perfil-email-enlace').href = `mailto:${perfil.email}`;
                
               
                const imgElement = document.getElementById('perfil-image');
                imgElement.src = `https://raw.githubusercontent.com/wholood/ATI-Retos-1-2025/reto-03/${ciPerfil}/${ciPerfil}.jpg`;
                imgElement.alt = `Foto de ${perfil.nombre}`;
            })
            .catch(error => {
                console.error('Error cargando el perfil:', error);
                alert('No se pudo cargar el perfil solicitado');
            });
    } else {
        alert('No se especificó un perfil para mostrar');
    }
});
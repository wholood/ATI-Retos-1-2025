document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener parámetros de la URL
    function getUrlParameter(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    // Función para detectar el idioma preferido
    function detectarIdioma() {
        // Verificar si hay un idioma en la URL (lang=ES|EN|PT)
        const urlLang = getUrlParameter('lang');
        if (urlLang && ['ES', 'EN', 'PT'].includes(urlLang.toUpperCase())) {
            const lang = urlLang.toUpperCase();
            localStorage.setItem('preferredLanguage', lang); // Guardar preferencia
            return lang;
        }
        
        // Si no, verificar si hay un idioma guardado en localStorage
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) return savedLang;
        
        //Si no, detectar idioma del navegador
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('es')) return 'ES';
        if (browserLang.startsWith('en')) return 'EN';
        if (browserLang.startsWith('pt')) return 'PT';
        
        //Si no, idioma por defecto
        return 'ES';
    }

    // Función para cargar configuración de idioma
    function cargarConfiguracion(language) {
        const configFile = `https://raw.githubusercontent.com/wholood/ATI-Retos-1-2025/reto-03/conf/config${language}.json`;
        return fetch(configFile)
            .then(response => response.text())
            .then(text => {
                const jsonString = text.replace(/^const config\s*=\s*/, '').replace(/;\s*$/, '');
                return JSON.parse(jsonString);
            });
    }


    function aplicarTraducciones(config) {
        
        document.getElementById('datos-color').innerHTML = `<strong>${config.color}:</strong> ${perfil.color}`;
        document.getElementById('datos-libro').innerHTML= `<strong>${config.libro}:</strong> ${perfil.libro.join(', ')}`;
        document.getElementById('datos-musica').innerHTML = `<strong>${config.musica}:</strong> ${perfil.musica.join(', ')}`;
        document.getElementById('datos-videojuegos').innerHTML = `<strong>${config.video_juego}:</strong> ${perfil.video_juego.join(', ')}`;
        document.getElementById('datos-lenguaje').innerHTML= `<strong>${config.lenguajes}:</strong> ${perfil.lenguajes.join(', ')}`;
        document.getElementById('perfil-email').innerHTML = config.email.replace('[email]', `<a id="perfil-email-enlace" href="mailto:${perfil.email}">${perfil.email}</a>`);

    }

    const ciPerfil = getUrlParameter('ci');
    let perfil; 
    
    if (ciPerfil) {
        const language = detectarIdioma();
        
        Promise.all([
            cargarConfiguracion(language),
            fetch(`https://raw.githubusercontent.com/wholood/ATI-Retos-1-2025/reto-03/${ciPerfil}/perfil.json`)
                .then(response => response.text())
                .then(text => {
                    const jsonString = text.replace(/^const perfil\s*=\s*/, '').replace(/;\s*$/, '');
                    perfil = JSON.parse(jsonString);
                    return perfil;
                })
        ])
        .then(([config, perfil]) => {
            document.getElementById('perfil-title').textContent = `${config.saludo} ${perfil.nombre}`;
            document.getElementById('perfil-name').textContent = perfil.nombre;
            document.getElementById('perfil-description').textContent = perfil.descripcion;
            
            aplicarTraducciones(config);
            
            const imgElement = document.getElementById('perfil-image');
            imgElement.src = `https://raw.githubusercontent.com/wholood/ATI-Retos-1-2025/reto-03/${ciPerfil}/${ciPerfil}.jpg`;
            imgElement.alt = `${config.saludo} ${perfil.nombre}`;
        })
        .catch(error => {
            console.error('Error cargando datos:', error);
            alert('No se pudo cargar la información solicitada');
        });
    } else {
        alert('No se especificó un perfil para mostrar');
    }
});
document.addEventListener('DOMContentLoaded', function() {
    function cargarConfiguracion(language) {
        const configFile = `conf/config${language}.json`;
        fetch(configFile)
            .then(response => response.text())
            .then(text => {
                const jsonString = text.replace(/^const config\s*=\s*/, '').replace(/;\s*$/, '');
                const config = JSON.parse(jsonString);
                
                document.getElementById('title').textContent = `${config.sitio[0]}${config.sitio[1]} ${config.sitio[2]}`;
                document.querySelector('.nav-title #nav-1').textContent = `${config.sitio[0]}`;
                document.querySelector('.nav-title #nav-2').textContent = `${config.sitio[1]}`;
                document.querySelector('.nav-title #nav-3').textContent = `${config.sitio[2]}`;
                document.getElementById('copyright').textContent = config.copyRight;
                document.querySelector('.search-form input').placeholder = config.nombre;
                document.querySelector('.search-form button').textContent = config.buscar;
                document.querySelector('.user-greeting').textContent = config.saludo;
            })
            .catch(error => console.error('Error cargando configuración:', error));
    }

    // Función para determinar el idioma inicial
    function detectarIdioma() {
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) return savedLang;
        
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('es')) return 'ES';
        if (browserLang.startsWith('en')) return 'EN';
        if (browserLang.startsWith('pt')) return 'PT';
        
        return 'ES';
    }

    const initialLanguage = detectarIdioma();
    cargarConfiguracion(initialLanguage);
    
});
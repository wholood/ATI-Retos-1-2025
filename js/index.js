document.addEventListener('DOMContentLoaded', function() {
    let perfiles = []; // Variable para almacenar todos los estudiantes
    let currentConfig = {}; // Variable para almacenar la configuración actual
    
    function cargarConfiguracion(language) {
        const configFile = `https://raw.githubusercontent.com/wholood/ATI-Retos-1-2025/reto-03/conf/config${language}.json`;
        return fetch(configFile)
            .then(response => response.text())
            .then(text => {
                const jsonString = text.replace(/^const config\s*=\s*/, '').replace(/;\s*$/, '');
                currentConfig = JSON.parse(jsonString);
                return currentConfig;
            });
    }

    function getUrlParameter(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    
    function detectarIdioma() {
        const urlLang = getUrlParameter('lang');
        if (urlLang && ['ES', 'EN', 'PT'].includes(urlLang.toUpperCase())) {
            const lang = urlLang.toUpperCase();
            localStorage.setItem('preferredLanguage', lang);
            return lang;
        }
        
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) return savedLang;
        
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('es')) return 'ES';
        if (browserLang.startsWith('en')) return 'EN';
        if (browserLang.startsWith('pt')) return 'PT';
        
        return 'ES';
    }

    function cargarEstudiantes() {
        return fetch('https://raw.githubusercontent.com/wholood/ATI-Retos-1-2025/reto-03/datos/index.json')
            .then(response => response.text())
            .then(text => {
                const jsonString = text.replace(/^const perfiles\s*=\s*/, '').replace(/;\s*$/, '');
                perfiles = JSON.parse(jsonString);
                mostrarEstudiantes(perfiles);
            });
    }

    function mostrarEstudiantes(estudiantesAMostrar) {
        const studentList = document.querySelector('.student-list');
        studentList.innerHTML = '';
        
        const existingNoResults = document.querySelector('.no-results');
        if (existingNoResults) {
            existingNoResults.remove();
        }
    
        if (!estudiantesAMostrar || estudiantesAMostrar.length === 0) {
            const noResults = document.createElement('li');
            noResults.className = 'no-results';
            const message = currentConfig?.noResults 
                ? currentConfig.noResults.replace('[query]', lastSearchQuery || '')
                : `No hay resultados para: ${lastSearchQuery || ''}`;
            
            noResults.textContent = message;
            studentList.appendChild(noResults);
            return;
        }
    
        
        estudiantesAMostrar.forEach(estudiante => {
            const studentItem = document.createElement('li');
            studentItem.className = 'student-item';
            
            const imgElement = document.createElement('img');
            imgElement.src = estudiante.imagen;
            imgElement.alt = estudiante.ci || 'Estudiante';
            
            const nameElement = document.createElement('div');
            nameElement.textContent = estudiante.nombre;
            
            studentItem.appendChild(imgElement);
            studentItem.appendChild(nameElement);
            studentList.appendChild(studentItem);
        });
    }
    
    let lastSearchQuery = '';
    function setupBusqueda() {
        const searchInput = document.querySelector('.search-form input');
        const searchForm = document.querySelector('.search-form');
        
        searchInput.addEventListener('input', function(e) {
            lastSearchQuery = e.target.value.trim().toLowerCase();
            if (lastSearchQuery === '') {
                mostrarEstudiantes(perfiles.slice(0, 12));
                return;
            }
            
            const resultados = perfiles.filter(estudiante => 
                estudiante.nombre.toLowerCase().includes(lastSearchQuery)
            ).slice(0, 12); 
            
            mostrarEstudiantes(resultados);
        });
        
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }

    // Inicialización
    const initialLanguage = detectarIdioma();
    cargarConfiguracion(initialLanguage)
        .then(() => {
            
            document.getElementById('title').textContent = `${currentConfig.sitio[0]}${currentConfig.sitio[1]} ${currentConfig.sitio[2]}`;
            document.querySelector('.nav-title #nav-1').textContent = currentConfig.sitio[0];
            document.querySelector('.nav-title #nav-2').textContent = currentConfig.sitio[1];
            document.querySelector('.nav-title #nav-3').textContent = currentConfig.sitio[2];
            document.getElementById('copyright').textContent = currentConfig.copyRight;
            document.querySelector('.search-form input').placeholder = currentConfig.nombre;
            document.querySelector('.search-form button').textContent = currentConfig.buscar;
            document.querySelector('.user-greeting').textContent = currentConfig.saludo ;
            
           
            return cargarEstudiantes();
        })
        .then(() => {
            setupBusqueda();
        })
        .catch(error => {
            console.error('Error inicializando:', error);
        });
});
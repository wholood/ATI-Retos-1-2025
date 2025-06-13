document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const mainContent = document.getElementById('main-content');
    const titleElement = document.getElementById('title');
    const nav1 = document.getElementById('nav-1');
    const nav2 = document.getElementById('nav-2');
    const nav3 = document.getElementById('nav-3');
    const copyright = document.getElementById('copyright');
    const searchInput = document.querySelector('.search-form input');
    const searchButton = document.querySelector('.search-form button');
    const userGreeting = document.querySelector('.user-greeting');
    const homeLink = document.querySelector('.nav-title-link');

    // Estado de la aplicación
    let perfiles = [];
    let currentConfig = {};

    // --- FUNCIONES DE UTILIDAD Y CONFIGURACIÓN ---

    const cargarConfiguracion = async (language) => {
        // Usamos una cookie para recordar el idioma. Expira en 30 días.
        document.cookie = `lang=${language};path=/;max-age=2592000`;
        const configFile = `/conf/config${language}.json`;
        try {
            const response = await fetch(configFile);
            if (!response.ok) throw new Error(`Config not found: ${configFile}`);
            const text = await response.text();
            // Limpiamos el JSON si viene como 'const config = {...};'
            const jsonString = text.replace(/^const\s+config\s*=\s*/, '').replace(/;\s*$/, '');
            currentConfig = JSON.parse(jsonString);
            aplicarTextosGlobales();
        } catch (error) {
            console.error('Error cargando configuración:', error);
            // Cargar configuración por defecto en caso de error
            if (language !== 'ES') {
                await cargarConfiguracion('ES');
            }
        }
    };

    const detectarIdioma = () => {
        // 1. Revisar parámetro en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && ['ES', 'EN', 'PT'].includes(urlLang.toUpperCase())) {
            return urlLang.toUpperCase();
        }
        // 2. Revisar cookie
        const cookieLang = document.cookie.split('; ').find(row => row.startsWith('lang='))?.split('=')[1];
        if (cookieLang) return cookieLang;
        // 3. Revisar localStorage (de la versión anterior)
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) return savedLang;
        // 4. Idioma del navegador
        const browserLang = (navigator.language || navigator.userLanguage).substring(0, 2);
        if (browserLang === 'es') return 'ES';
        if (browserLang === 'en') return 'EN';
        if (browserLang === 'pt') return 'PT';
        // 5. Por defecto
        return 'ES';
    };
    
    const aplicarTextosGlobales = () => {
        if (!currentConfig.sitio) return;
        titleElement.textContent = `${currentConfig.sitio[0]}${currentConfig.sitio[1]} ${currentConfig.sitio[2]}`;
        nav1.textContent = currentConfig.sitio[0];
        nav2.textContent = currentConfig.sitio[1];
        nav3.textContent = currentConfig.sitio[2];
        copyright.textContent = currentConfig.copyRight;
        searchInput.placeholder = currentConfig.nombre;
        searchButton.textContent = currentConfig.buscar;
        userGreeting.textContent = currentConfig.saludo;
    };

    // --- FUNCIONES DE RENDERIZACIÓN DE VISTAS ---

    const renderizarVistaLista = async () => {
        // Prepara el HTML para la lista de estudiantes
        mainContent.innerHTML = '<ul class="student-list"></ul>';
        const studentList = mainContent.querySelector('.student-list');

        try {
            const response = await fetch('/datos/index.json');
            if (!response.ok) throw new Error('No se pudo cargar el índice de perfiles.');
            const text = await response.text();
            const jsonString = text.replace(/^const\s+perfiles\s*=\s*/, '').replace(/;\s*$/, '');
            perfiles = JSON.parse(jsonString);

            mostrarEstudiantes(perfiles);
            setupBusqueda();

        } catch (error) {
            console.error('Error cargando la lista de estudiantes:', error);
            studentList.innerHTML = `<li class="no-results">${currentConfig.errorCarga || 'Error al cargar los datos.'}</li>`;
        }
    };

    const mostrarEstudiantes = (estudiantesAMostrar) => {
        const studentList = document.querySelector('.student-list');
        if (!studentList) return;
        studentList.innerHTML = '';

        if (!estudiantesAMostrar || estudiantesAMostrar.length === 0) {
            studentList.innerHTML = `<li class="no-results">${currentConfig.noResults || 'No hay resultados.'}</li>`;
            return;
        }

        estudiantesAMostrar.forEach(estudiante => {
            const studentItem = document.createElement('li');
            studentItem.className = 'student-item';
            // Usamos el hash para la navegación SPA
            studentItem.innerHTML = `
                <a href="#/perfil/${estudiante.ci}">
                    <img src="/${estudiante.imagen}" alt="${estudiante.nombre}">
                    <div>${estudiante.nombre}</div>
                </a>
            `;
            studentList.appendChild(studentItem);
        });
    };

    const renderizarVistaPerfil = async (ci) => {
        mainContent.innerHTML = `<div class="loading">${currentConfig.cargando || 'Cargando...'}</div>`;
        const lang = detectarIdioma();
        try {
            // Hacemos fetch al endpoint de Python que genera el HTML del perfil
            const response = await fetch(`/api/perfil?ci=${ci}&lang=${lang}`);
            if (!response.ok) throw new Error('Perfil no encontrado');
            
            const perfilHtml = await response.text();
            mainContent.innerHTML = perfilHtml;
        } catch (error) {
            console.error('Error cargando el perfil:', error);
            mainContent.innerHTML = `<div class="no-results">${currentConfig.errorPerfil || 'No se pudo cargar el perfil.'}</div>`;
        }
    };
    
    const setupBusqueda = () => {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            const resultados = perfiles.filter(p => p.nombre.toLowerCase().includes(query));
            mostrarEstudiantes(resultados);
        });
        document.querySelector('.search-form').addEventListener('submit', e => e.preventDefault());
    };
    

    // --- ENRUTADOR (ROUTER) ---
    const router = () => {
        const path = window.location.hash.slice(1) || '/'; // ej: '/', '/perfil/1234567'
        if (path.startsWith('/perfil/')) {
            const ci = path.split('/')[2];
            renderizarVistaPerfil(ci);
        } else {
            renderizarVistaLista();
        }
    };

    // --- INICIALIZACIÓN ---
    const init = async () => {
        // Asegurarse de que al hacer clic en el logo, se vaya a la página principal sin recargar
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#/';
        });

        const lang = detectarIdioma();
        await cargarConfiguracion(lang);
        
        // Escuchar cambios en el hash para la navegación
        window.addEventListener('hashchange', router);
        // Cargar la vista inicial basada en la URL actual
        router();
    };

    init();
});

// static/js/certificaciones.js

/* ================= SIDEBAR ================= */
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const navOverlay = document.getElementById('navOverlay');

    function toggleNav() {
        sidebarNav.classList.toggle('show');
        navOverlay.classList.toggle('show');
        hamburgerBtn.classList.toggle('hide');
    }
    
    function closeNav() {
        sidebarNav.classList.remove('show');
        navOverlay.classList.remove('show');
        hamburgerBtn.classList.remove('hide');
    }
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleNav);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    /* ================= BÚSQUEDA EN TIEMPO REAL ================= */
    const input = document.getElementById('busqueda');
    const form = document.getElementById('form-busqueda');
    const tabla = document.getElementById('tabla-usuarios');

    if (input && form && tabla) {
        let timer;
        const delay = 400;

        function liveSearch() {
            const query = input.value;

            fetch(`?q=${encodeURIComponent(query)}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.text())
            .then(data => {
                tabla.innerHTML = data;
                
                // Ajustar visibilidad según el tamaño de pantalla
                setTimeout(() => {
                    adjustTableVisibility();
                }, 100);
            })
            .catch(error => console.error('Error en la búsqueda:', error));
        }

        // Búsqueda en tiempo real
        input.addEventListener('keyup', function () {
            clearTimeout(timer);
            timer = setTimeout(liveSearch, delay);
        });

        // Evita recarga cuando presionas el botón Buscar
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            liveSearch();
        });
    }

    /* ================= FUNCIÓN PARA AJUSTAR VISIBILIDAD ================= */
    function adjustTableVisibility() {
        const tableContainer = document.querySelector('.table-container');
        const cardsContainer = document.querySelector('.cards-container');
        
        if (!tableContainer || !cardsContainer) return;
        
        // En pantallas grandes (más de 768px), mostrar tabla y ocultar cards
        if (window.innerWidth > 768) {
            tableContainer.style.display = 'block';
            cardsContainer.style.display = 'none';
        } else {
            // En móviles, mostrar cards y ocultar tabla
            tableContainer.style.display = 'none';
            cardsContainer.style.display = 'block';
        }
    }

    /* ================= INICIALIZACIÓN ================= */
    // Ajustar visibilidad inicial
    adjustTableVisibility();
    
    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', adjustTableVisibility);
    
    // Mostrar sidebar activo
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
});
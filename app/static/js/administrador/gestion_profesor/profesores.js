/* ================= SIDEBAR ================= */
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

hamburgerBtn?.addEventListener('click', toggleNav);
navOverlay?.addEventListener('click', closeNav);

document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
});

/* ================= BÚSQUEDA EN TIEMPO REAL ================= */
const buscador = document.getElementById('buscador');
const tabla = document.getElementById('tabla-profesores');
const searchForm = document.getElementById('searchForm');

let timer;
const delay = 400;

function liveSearch() {
    const query = buscador.value;

    fetch(`?q=${query}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.text())
    .then(html => {
        tabla.innerHTML = html;
        
        // Ajustar visibilidad según el tamaño de pantalla
        setTimeout(() => {
            adjustTableVisibility();
        }, 100);
    })
    .catch(error => console.error('Error en la búsqueda:', error));
}

// Evento para búsqueda en tiempo real con delay
buscador.addEventListener("keyup", () => {
    clearTimeout(timer);
    timer = setTimeout(liveSearch, delay);
});

// Evento para el formulario de búsqueda
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    liveSearch();
});

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

/* ================= INITIALIZATION ================= */
document.addEventListener("DOMContentLoaded", function() {
    // Ajustar visibilidad inicial
    adjustTableVisibility();
    
    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', adjustTableVisibility);
    
    // Mostrar sidebar activo
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.href.includes(currentPath)) {
            link.classList.add('active');
        }
    });
});
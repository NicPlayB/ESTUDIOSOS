// ===== MANEJO DEL SIDEBAR RESPONSIVE =====
function initSidebar() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const navOverlay = document.getElementById('navOverlay');

    if (!hamburgerBtn || !sidebarNav || !navOverlay) return;

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

    // Event listeners
    hamburgerBtn.addEventListener('click', toggleNav);
    navOverlay.addEventListener('click', closeNav);

    // Cerrar nav cuando se hace click en un link
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Cerrar nav cuando se redimensiona la ventana y vuelve al tamaño desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeNav();
        }
    });
}

// ===== NUEVO SISTEMA DE ALERTAS =====
// Configuración de los tipos de alerta
const toastDetails = {
    success: {
        icon: 'check_circle',
        title: '¡Operación Exitosa!',
        color: '#2ecc71'
    },
    error: {
        icon: 'cancel',
        title: 'Ocurrió un error',
        color: '#e74c3c'
    },
    warning: {
        icon: 'warning',
        title: 'Advertencia',
        color: '#f1c40f'
    },
    info: {
        icon: 'info',
        title: 'Información',
        color: '#3498db'
    }
};

// Función para crear iconos SVG simples
function getIconSVG(type) {
    const icons = {
        success: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        error: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        warning: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        info: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };
    return icons[type] || icons.info;
}

// Función para mostrar alertas desde Django messages
function showDjangoToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const { title, color } = toastDetails[type];

    // Crear el elemento
    const toast = document.createElement('div');
    toast.className = `toast style-clean ${type}`;
    
    // Inyectar HTML dentro de la alerta
    toast.innerHTML = `
        <div class="toast-icon">
            ${getIconSVG(type)}
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast(this.parentElement)">&times;</button>
        <div class="toast-progress" style="color: ${color}"></div>
    `;

    // Agregar al DOM
    container.appendChild(toast);

    // Auto eliminar después de 4 segundos
    setTimeout(() => {
        removeToast(toast);
    }, 4000);
}

function removeToast(toastElement) {
    // Evitar errores si el elemento ya fue removido
    if (!toastElement.parentElement) return;

    toastElement.classList.add('hide'); // Inicia animación de salida
    
    // Esperar a que termine la animación para borrar del DOM
    toastElement.addEventListener('animationend', () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    });
}

// ===== EFECTO HOVER MEJORADO PARA TARJETAS =====
function initCardHoverEffects() {
    document.querySelectorAll('.card-menu').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });
}

// ===== MANEJO DE TECLA ESCAPE =====
function initEscapeHandler() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const sidebarNav = document.querySelector('.sidebar-nav');
            const navOverlay = document.getElementById('navOverlay');
            const hamburgerBtn = document.getElementById('hamburgerBtn');
            
            // Cerrar sidebar si está abierto en móvil
            if (sidebarNav && sidebarNav.classList.contains('show')) {
                sidebarNav.classList.remove('show');
                navOverlay.classList.remove('show');
                hamburgerBtn.classList.remove('hide');
            }
        }
    });
}

// ===== FUNCIÓN PARA MOSTRAR ALERTAS MANUALMENTE =====
function showToast(type, message, customTitle = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const details = toastDetails[type] || toastDetails.info;
    const title = customTitle || details.title;
    const color = details.color;

    // Crear el elemento
    const toast = document.createElement('div');
    toast.className = `toast style-clean ${type}`;
    
    // Inyectar HTML dentro de la alerta
    toast.innerHTML = `
        <div class="toast-icon">
            ${getIconSVG(type)}
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="removeToast(this.parentElement)">&times;</button>
        <div class="toast-progress" style="color: ${color}"></div>
    `;

    // Agregar al DOM
    container.appendChild(toast);

    // Auto eliminar después de 4 segundos
    setTimeout(() => {
        removeToast(toast);
    }, 4000);
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener("DOMContentLoaded", function() {
    // Inicializar componentes
    initSidebar();
    initCardHoverEffects();
    initEscapeHandler();
    
    // Hacer funciones globales accesibles
    window.showDjangoToast = showDjangoToast;
    window.showToast = showToast;
    window.removeToast = removeToast;
    
    console.log('Menú de clase inicializado correctamente');
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});
// ===== FUNCIONALIDAD PARA LAS NUEVAS ALERTAS CLEAN (BORDE) =====
// Función para eliminar alertas
function removeAlertToast(toastElement) {
    if (!toastElement.parentElement) return;
    
    toastElement.classList.add('hide');
    
    toastElement.addEventListener('animationend', () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    });
}

// Auto-cierre después de 5 segundos
document.addEventListener('DOMContentLoaded', function() {
    const alertToasts = document.querySelectorAll('.alert-toast');
    alertToasts.forEach(toast => {
        setTimeout(() => {
            removeAlertToast(toast);
        }, 5000);
        
        // Agregar evento al botón de cerrar
        const closeBtn = toast.querySelector('.alert-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                removeAlertToast(toast);
            });
        }
    });
});

// ===== MANEJO DEL SIDEBAR RESPONSIVE =====
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarNav = document.querySelector('.sidebar-nav');
const navOverlay = document.getElementById('navOverlay');
const mainLayout = document.querySelector('.main-layout');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        sidebarNav.classList.toggle('show');
        navOverlay.classList.toggle('show');
        hamburgerBtn.classList.toggle('hide');
    });
}

if (navOverlay) {
    navOverlay.addEventListener('click', () => {
        sidebarNav.classList.remove('show');
        navOverlay.classList.remove('show');
        hamburgerBtn.classList.remove('hide');
    });
}

// ===== EFECTO HOVER MEJORADO PARA TARJETAS =====
document.querySelectorAll('.card-admin').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

// ===== MANEJO DE TECLA ESCAPE =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (sidebarNav.classList.contains('show')) {
            sidebarNav.classList.remove('show');
            navOverlay.classList.remove('show');
            hamburgerBtn.classList.remove('hide');
        }
    }
});
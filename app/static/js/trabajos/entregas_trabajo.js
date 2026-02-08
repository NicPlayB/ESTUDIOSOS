document.addEventListener("DOMContentLoaded", function() {
    // ===== MANEJO DEL SIDEBAR (IGUAL QUE CÓDIGO 1) =====
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

    // Event listeners
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleNav);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

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

    // ===== NUEVO JAVASCRIPT PARA ALERTAS CLEAN (BORDE) =====
    // Función para eliminar alertas
    function removeAlertToast(toastElement) {
        if (!toastElement || !toastElement.parentElement) return;
        
        toastElement.classList.add('hide');
        
        toastElement.addEventListener('animationend', () => {
            if (toastElement.parentElement) {
                toastElement.remove();
            }
        });
    }

    // Auto-cierre después de 5 segundos y agregar funcionalidad de cierre
    const alertToasts = document.querySelectorAll('.alert-toast');
    alertToasts.forEach(toast => {
        // Auto-cierre después de 5 segundos
        setTimeout(() => {
            removeAlertToast(toast);
        }, 5000);
        
        // Agregar evento de clic al botón de cierre
        const closeBtn = toast.querySelector('.alert-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                removeAlertToast(toast);
            });
        }
    });
});
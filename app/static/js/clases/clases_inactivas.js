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

// ===== FUNCIÓN PARA ELIMINAR ALERTAS (ESTILO CLEAN) =====
function removeAlertToast(toastElement) {
    if (!toastElement.parentElement) return;
    
    toastElement.classList.add('hide');
    
    toastElement.addEventListener('animationend', () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    });
}

// ===== AUTO-CERRAR ALERTAS DESPUÉS DE 5 SEGUNDOS =====
document.addEventListener('DOMContentLoaded', function() {
    const alertToasts = document.querySelectorAll('.alert-toast');
    alertToasts.forEach(toast => {
        setTimeout(() => {
            removeAlertToast(toast);
        }, 5000); // 5 segundos para coincidir con la animación de la barra
    });
    
    // Verificar si hay mensajes de éxito para mostrar el modal (pasados desde Django)
    if (window.MESSAGES && window.MESSAGES.success) {
        mostrarModalExito(window.MESSAGES.success);
    }
});

// ===== EFECTO HOVER MEJORADO PARA TARJETAS =====
document.querySelectorAll('.clase-card').forEach(card => {
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

// ===== FUNCIONES PARA LOS MODALES =====
function mostrarModalExito(mensaje) {
    if (mensaje) {
        document.getElementById('mensajeExito').textContent = mensaje;
    }
    
    setTimeout(function() {
        var backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(function(backdrop) {
            backdrop.remove();
        });
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        var modalExito = document.getElementById('modalExito');
        if (modalExito) {
            var modal = new bootstrap.Modal(modalExito);
            modal.show();
        }
    }, 100);
}

// Función para confirmar activación de clase (opcional - mantengo por compatibilidad)
function confirmarActivacion(claseId) {
    var confirmacion = confirm("¿Estás seguro de que deseas activar esta clase?");
    if (confirmacion) {
        var form = document.querySelector(`form[action*="${claseId}"]`);
        if (form) {
            form.submit();
        }
    }
}
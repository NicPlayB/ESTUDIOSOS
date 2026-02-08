// ===== MANEJO DEL SIDEBAR RESPONSIVE =====
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarNav = document.querySelector('.sidebar-nav');
const navOverlay = document.getElementById('navOverlay');
const mainLayout = document.querySelector('.main-layout');

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        sidebarNav.classList.toggle('show');
        navOverlay.classList.toggle('show');
        if (hamburgerBtn) hamburgerBtn.classList.toggle('hide');
    });
}

if (navOverlay) {
    navOverlay.addEventListener('click', () => {
        sidebarNav.classList.remove('show');
        navOverlay.classList.remove('show');
        if (hamburgerBtn) hamburgerBtn.classList.remove('hide');
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
        if (sidebarNav && sidebarNav.classList.contains('show')) {
            sidebarNav.classList.remove('show');
            if (navOverlay) navOverlay.classList.remove('show');
            if (hamburgerBtn) hamburgerBtn.classList.remove('hide');
        }
    }
});

// ===== FUNCIÓN PARA COPIAR CÓDIGO =====
function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo).then(function() {
        // Crear alerta de éxito temporal
        const alertContainer = document.querySelector('.alert-container');
        const toast = document.createElement('div');
        toast.className = 'alert-toast success';
        toast.innerHTML = `
            <div class="alert-toast-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <div class="alert-toast-content">
                <div class="alert-toast-title">¡Código Copiado!</div>
                <div class="alert-toast-message">Código copiado al portapapeles: ${codigo}</div>
            </div>
            <button class="alert-toast-close" onclick="removeAlertToast(this.parentElement)">&times;</button>
            <div class="alert-toast-progress" style="color: var(--alert-success)"></div>
        `;
        alertContainer.appendChild(toast);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            removeAlertToast(toast);
        }, 5000);
    }).catch(function(err) {
        console.error('Error al copiar: ', err);
        
        // Mostrar alerta de error
        const alertContainer = document.querySelector('.alert-container');
        const toast = document.createElement('div');
        toast.className = 'alert-toast error';
        toast.innerHTML = `
            <div class="alert-toast-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <div class="alert-toast-content">
                <div class="alert-toast-title">Error</div>
                <div class="alert-toast-message">No se pudo copiar el código</div>
            </div>
            <button class="alert-toast-close" onclick="removeAlertToast(this.parentElement)">&times;</button>
            <div class="alert-toast-progress" style="color: var(--alert-error)"></div>
        `;
        alertContainer.appendChild(toast);
        
        setTimeout(() => {
            removeAlertToast(toast);
        }, 5000);
    });
}

// ===== FUNCIONES PARA LOS MODALES =====
function enviarFormularioEditar(claseId) {
    var modalConfirmar = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarGuardarCambios' + claseId));
    if (modalConfirmar) {
        modalConfirmar.hide();
    }
    
    var modalEditar = bootstrap.Modal.getInstance(document.getElementById('modalEditarClase' + claseId));
    if (modalEditar) {
        modalEditar.hide();
    }
    
    var form = document.getElementById('editarForm' + claseId);
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'editar_clase';
    input.value = '1';
    form.appendChild(input);
    
    form.submit();
}

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
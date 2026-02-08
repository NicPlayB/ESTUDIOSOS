// ===== FUNCIONALIDAD PARA ALERTAS =====
function removeAlertToast(toastElement) {
    if (!toastElement || !toastElement.parentElement) return;
    
    toastElement.classList.add('hide');
    
    toastElement.addEventListener('animationend', () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    });
}

// ===== FUNCIONALIDAD DE TOGGLE DE CONTRASEÑA =====
function initPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// ===== VALIDACIÓN DE FORMULARIO =====
function initFormValidation() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    // Validación en tiempo real de campos
    document.querySelectorAll('.input-group input').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.required) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
        
        // Limpiar error al empezar a escribir
        field.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Validación antes de enviar
    form.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('input[required]');
        
        requiredFields.forEach(field => {
            if (field.value.trim() === '') {
                field.classList.add('is-invalid');
                isValid = false;
                
                // Mostrar mensaje de error si no existe
                let errorBox = field.parentElement.nextElementSibling;
                if (!errorBox || !errorBox.classList.contains('error-box')) {
                    errorBox = document.createElement('div');
                    errorBox.className = 'error-box';
                    errorBox.innerHTML = `
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <span>Este campo es obligatorio</span>
                    `;
                    field.parentElement.parentElement.appendChild(errorBox);
                }
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            // Mostrar alerta de error
            showCustomAlert('error', 'Por favor, completa todos los campos obligatorios');
        } else {
            // Guardar preferencia de "Recordar"
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberLogin', 'true');
            } else {
                localStorage.removeItem('rememberLogin');
            }
        }
    });
}

// ===== FUNCIÓN PARA MOSTRAR ALERTAS PERSONALIZADAS =====
function showCustomAlert(type, message, title = null) {
    const container = document.querySelector('.alert-container');
    if (!container) return;
    
    const alertTypes = {
        success: {
            icon: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            title: 'Éxito',
            color: '#2ecc71'
        },
        error: {
            icon: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            title: 'Error',
            color: '#e74c3c'
        },
        warning: {
            icon: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            title: 'Advertencia',
            color: '#f1c40f'
        },
        info: {
            icon: '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            title: 'Información',
            color: '#3498db'
        }
    };
    
    const alertConfig = alertTypes[type] || alertTypes.info;
    const alertTitle = title || alertConfig.title;
    
    // Crear elemento de alerta
    const toast = document.createElement('div');
    toast.className = `alert-toast ${type}`;
    toast.innerHTML = `
        <div class="alert-toast-icon">
            ${alertConfig.icon}
        </div>
        <div class="alert-toast-content">
            <div class="alert-toast-title">${alertTitle}</div>
            <div class="alert-toast-message">${message}</div>
        </div>
        <button class="alert-toast-close">&times;</button>
        <div class="alert-toast-progress" style="color: ${alertConfig.color}"></div>
    `;
    
    container.appendChild(toast);
    
    // Configurar auto-cierre
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
}

// ===== INICIALIZACIÓN DE ALERTAS DE DJANGO =====
function initDjangoAlerts() {
    const alertToasts = document.querySelectorAll('.alert-toast');
    
    alertToasts.forEach(toast => {
        // Auto-cierre después de 5 segundos
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
}

// ===== RESTAURAR PREFERENCIAS DE USUARIO =====
function restoreUserPreferences() {
    const rememberLogin = localStorage.getItem('rememberLogin');
    if (rememberLogin === 'true') {
        const rememberCheckbox = document.getElementById('rememberMe');
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
        
        // Intentar restaurar datos del formulario si están guardados
        // (esto es un ejemplo básico, en producción usarías métodos más seguros)
        try {
            const savedEmail = localStorage.getItem('savedEmail');
            const emailField = document.querySelector('input[type="email"]');
            if (savedEmail && emailField) {
                emailField.value = savedEmail;
            }
        } catch (e) {
            console.log('No se pudieron restaurar los datos guardados');
        }
    }
}

// ===== MANEJO DE ERRORES DE FORMULARIO DE DJANGO =====
function highlightDjangoFormErrors() {
    // Resaltar campos con errores de Django
    document.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.add('is-invalid');
        
        // Asegurarse de que haya un mensaje de error visible
        const errorBox = field.parentElement.nextElementSibling;
        if (errorBox && errorBox.classList.contains('error-box')) {
            errorBox.style.display = 'flex';
        }
    });
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initDjangoAlerts();
    initPasswordToggle();
    initFormValidation();
    restoreUserPreferences();
    highlightDjangoFormErrors();
    
    // Hacer funciones globales accesibles
    window.removeAlertToast = removeAlertToast;
    window.showCustomAlert = showCustomAlert;
    
    console.log('Sistema de login inicializado correctamente');
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    
    // Mostrar alerta de error genérico
    if (e.error && e.error.message) {
        showCustomAlert('error', 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.');
    }
});
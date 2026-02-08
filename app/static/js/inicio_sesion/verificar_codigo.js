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
    
    return toast;
}

// ===== VALIDACIÓN DE CÓDIGO =====
function initCodeValidation() {
    const codeInput = document.getElementById('id_codigo');
    if (!codeInput) return;
    
    // Solo permitir números y limitar a 6 dígitos
    codeInput.addEventListener('input', function() {
        // Solo permitir números
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Limitar a 6 dígitos
        if (this.value.length > 6) {
            this.value = this.value.substring(0, 6);
        }
        
        // Auto-submit si se completan 6 dígitos (opcional)
        if (this.value.length === 6) {
            // Puedes activar auto-submit si lo deseas
            // this.form.submit();
        }
    });
    
    // Validar al perder foco
    codeInput.addEventListener('blur', function() {
        if (this.value.trim() === '' && this.required) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });
    
    // Limpiar error al escribir
    codeInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.classList.remove('is-invalid');
        }
    });
}

// ===== FUNCIONALIDAD DE REENVÍO DE CÓDIGO =====
function initResendCode() {
    const resendLink = document.getElementById('resend-code-link');
    const countdownTimer = document.getElementById('countdown-timer');
    
    if (!resendLink || !countdownTimer) return;
    
    // Estado inicial (podría cargarse desde localStorage)
    let canResend = true;
    let countdownInterval = null;
    
    // Verificar si hay un contador activo en localStorage
    const savedEndTime = localStorage.getItem('codeResendEndTime');
    if (savedEndTime) {
        const endTime = parseInt(savedEndTime, 10);
        const now = Date.now();
        
        if (endTime > now) {
            startCountdown(Math.ceil((endTime - now) / 1000));
        }
    }
    
    resendLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!canResend) return;
        
        // Deshabilitar temporalmente
        canResend = false;
        this.classList.add('disabled');
        
        // Mostrar mensaje de envío
        countdownTimer.style.display = 'block';
        countdownTimer.textContent = 'Enviando nuevo código...';
        countdownTimer.style.color = '#ff7b00';
        
        // Aquí deberías hacer una petición AJAX a tu backend
        // Por ahora simulamos con un setTimeout
        setTimeout(() => {
            // Simular éxito
            showCustomAlert('success', '¡Código reenviado!', 'Se ha enviado un nuevo código a tu correo electrónico.');
            
            // Iniciar cuenta regresiva de 60 segundos
            startCountdown(60);
            
            // Guardar tiempo de finalización en localStorage
            const endTime = Date.now() + 60000; // 60 segundos
            localStorage.setItem('codeResendEndTime', endTime.toString());
        }, 1500);
    });
    
    function startCountdown(seconds) {
        let remaining = seconds;
        
        // Actualizar inmediatamente
        updateCountdownDisplay(remaining);
        
        // Iniciar intervalo
        countdownInterval = setInterval(() => {
            remaining--;
            updateCountdownDisplay(remaining);
            
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                countdownTimer.style.display = 'none';
                resendLink.classList.remove('disabled');
                canResend = true;
                localStorage.removeItem('codeResendEndTime');
            }
        }, 1000);
    }
    
    function updateCountdownDisplay(seconds) {
        countdownTimer.textContent = `Puedes solicitar otro código en ${seconds} segundos`;
        countdownTimer.style.color = '#666';
    }
}

// ===== VALIDACIÓN DE FORMULARIO =====
function initFormValidation() {
    const form = document.getElementById('verificationForm');
    const verifyBtn = document.getElementById('verifyBtn');
    
    if (!form || !verifyBtn) return;
    
    form.addEventListener('submit', function(e) {
        const codeInput = document.getElementById('id_codigo');
        
        // Validar longitud del código
        if (codeInput.value.length !== 6) {
            e.preventDefault();
            codeInput.classList.add('is-invalid');
            
            // Mostrar error
            showCustomAlert('error', 'El código debe tener exactamente 6 dígitos', 'Código inválido');
            
            // Enfocar el campo
            codeInput.focus();
            return;
        }
        
        // Validar que solo contenga números
        if (!/^\d{6}$/.test(codeInput.value)) {
            e.preventDefault();
            codeInput.classList.add('is-invalid');
            
            showCustomAlert('error', 'El código solo debe contener números', 'Código inválido');
            codeInput.focus();
            return;
        }
        
        // Deshabilitar botón durante el envío
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> VERIFICANDO...';
        
        // Re-habilitar después de 3 segundos por si hay error
        setTimeout(() => {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fa-solid fa-shield-alt"></i> VERIFICAR CÓDIGO';
        }, 3000);
    });
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

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initDjangoAlerts();
    initCodeValidation();
    initResendCode();
    initFormValidation();
    
    // Hacer funciones globales accesibles
    window.removeAlertToast = removeAlertToast;
    window.showCustomAlert = showCustomAlert;
    
    // Auto-focus en el campo de código
    const codeInput = document.getElementById('id_codigo');
    if (codeInput) {
        setTimeout(() => {
            codeInput.focus();
        }, 300);
    }
    
    console.log('Sistema de verificación de código inicializado');
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    
    // Mostrar alerta de error genérico
    showCustomAlert('error', 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.');
});
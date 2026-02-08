// restablecer_password.js

// ===== FUNCIONALIDAD PARA ALERTAS =====
function removeAlertToast(toastElement) {
    if (!toastElement || !toastElement.parentElement) return;
    
    toastElement.classList.add('hide');
    
    const removeElement = () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    };
    
    // Usar animationend o timeout como fallback
    if (toastElement.style.animationName !== 'none') {
        toastElement.addEventListener('animationend', removeElement, { once: true });
    } else {
        setTimeout(removeElement, 500);
    }
}

// Inicializar alertas existentes
function initAlerts() {
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
}

// ===== FUNCIONALIDAD DEL FORMULARIO =====
function initFormValidation() {
    // Toggle de visibilidad de contraseña
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
            
            // Mantener el foco en el input
            input.focus();
        });
    });

    // Elementos del DOM
    const nuevaContrasena = document.getElementById('nueva_contraseña');
    const confirmarContrasena = document.getElementById('confirmar_contraseña');
    const passwordMatch = document.getElementById('password-match');
    const submitBtn = document.getElementById('submit-btn');
    
    // Requisitos de contraseña
    const reqItems = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special')
    };

    // Validar fortaleza de contraseña
    function validatePassword(password) {
        const validations = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        // Actualizar visualización de requisitos
        Object.keys(validations).forEach(key => {
            const reqItem = reqItems[key];
            const isValid = validations[key];
            
            reqItem.classList.remove('valid', 'invalid');
            reqItem.classList.add(isValid ? 'valid' : 'invalid');
            
            const icon = reqItem.querySelector('i');
            if (icon) {
                icon.className = isValid ? 'fa-solid fa-check-circle' : 'fa-solid fa-circle';
                icon.style.color = isValid ? '#2ecc71' : '#e74c3c';
            }
        });

        return Object.values(validations).every(v => v);
    }

    // Verificar coincidencia de contraseñas
    function checkPasswordMatch() {
        const password = nuevaContrasena.value;
        const confirm = confirmarContrasena.value;
        
        if (confirm === '') {
            passwordMatch.style.display = 'none';
            return true;
        }
        
        if (password === confirm) {
            passwordMatch.style.display = 'none';
            return true;
        } else {
            passwordMatch.style.display = 'flex';
            return false;
        }
    }

    // Validar formulario completo
    function validateForm() {
        if (!nuevaContrasena || !confirmarContrasena || !submitBtn) return;
        
        const passwordValid = validatePassword(nuevaContrasena.value);
        const matchValid = checkPasswordMatch();
        const passwordsFilled = nuevaContrasena.value && confirmarContrasena.value;
        
        const isValid = passwordValid && matchValid && passwordsFilled;
        
        submitBtn.disabled = !isValid;
        
        if (submitBtn.disabled) {
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        } else {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
        
        return isValid;
    }

    // Event listeners para validación en tiempo real
    if (nuevaContrasena) {
        nuevaContrasena.addEventListener('input', function() {
            validatePassword(this.value);
            checkPasswordMatch();
            validateForm();
        });

        nuevaContrasena.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.required) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

    if (confirmarContrasena) {
        confirmarContrasena.addEventListener('input', function() {
            checkPasswordMatch();
            validateForm();
        });

        confirmarContrasena.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.required) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

    // Validación inicial
    validateForm();
}

// ===== INICIALIZACIÓN GENERAL =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de alertas
    initAlerts();
    
    // Inicializar validación de formulario
    initFormValidation();
    
    // Prevenir envío doble del formulario
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('#submit-btn');
            if (submitBtn && submitBtn.disabled) {
                e.preventDefault();
                return false;
            }
            
            // Mostrar indicador de carga
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PROCESANDO...';
                submitBtn.disabled = true;
                
                // Restaurar después de 5 segundos (por si hay error)
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    }
});
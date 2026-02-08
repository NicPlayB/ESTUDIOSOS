// ===== FUNCIONALIDAD PARA ALERTAS =====
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

    /* Toggle de contraseña */
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

    // ===== MANEJO DE SELECTS =====
    // Función para manejar selects
    function handleSelect(select) {
        if (select.value && select.value !== '') {
            select.classList.add('has-value');
            select.style.color = '#333';
        } else {
            select.classList.remove('has-value');
            select.style.color = 'transparent';
        }
    }
    
    // Aplicar a todos los selects
    document.querySelectorAll('.input-wrapper select').forEach(select => {
        // Manejar valor inicial
        handleSelect(select);
        
        // Agregar eventos
        select.addEventListener('change', function() {
            handleSelect(this);
            // Remover error visual al cambiar
            this.classList.remove('input-error');
            const errorBox = this.closest('.field-container').querySelector('.error-container');
            if (errorBox) {
                errorBox.remove();
            }
        });
        
        select.addEventListener('focus', function() {
            this.style.backgroundColor = '#fff';
            this.style.boxShadow = '0 0 0 2px #ff7b00';
            this.style.borderColor = '#ff7b00';
            this.parentElement.querySelector('.floating-label').style.color = '#ff7b00';
        });
        
        select.addEventListener('blur', function() {
            this.style.backgroundColor = '#f8f9fa';
            this.style.boxShadow = 'none';
            this.style.borderColor = '#e9ecef';
            
            if (!this.value) {
                this.parentElement.querySelector('.floating-label').style.color = '#6c757d';
            } else {
                this.parentElement.querySelector('.floating-label').style.color = '#ff7b00';
            }
        });
    });
    
    // Manejar campo de fecha
    const fechaInput = document.getElementById('{{ form.fecha_nacimiento.id_for_label }}');
    if (fechaInput) {
        fechaInput.addEventListener('focus', function() {
            this.style.backgroundColor = '#fff';
            this.style.boxShadow = '0 0 0 2px #ff7b00';
            this.style.borderColor = '#ff7b00';
        });
        
        fechaInput.addEventListener('blur', function() {
            this.style.backgroundColor = '#f8f9fa';
            this.style.boxShadow = 'none';
            this.style.borderColor = '#e9ecef';
        });
    }
    
    // Manejar inputs de texto normales
    document.querySelectorAll('.input-wrapper input[type="text"], .input-wrapper input[type="email"], .input-wrapper input[type="tel"]').forEach(input => {
        // Verificar valor inicial
        if (input.value && input.value.trim() !== '') {
            input.classList.add('has-value');
        }
        
        input.addEventListener('input', function() {
            if (this.value && this.value.trim() !== '') {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
            
            // Remover error visual al escribir
            this.classList.remove('input-error');
            const errorBox = this.closest('.field-container').querySelector('.error-container');
            if (errorBox) {
                errorBox.remove();
            }
        });
    });
    
    // Manejar campos con errores al cargar
    document.querySelectorAll('.input-error').forEach(field => {
        if (field.tagName === 'SELECT') {
            field.style.color = '#333';
            field.style.backgroundColor = '#fff5f5';
        }
    });

    // Scroll automático para mostrar encabezado cuando hay errores
    const errorBoxes = document.querySelectorAll('.error-box');
    if (errorBoxes.length > 0) {
        setTimeout(() => {
            const formContent = document.getElementById('form-content');
            // Hacer scroll al principio del formulario
            formContent.scrollTop = 0;
        }, 100);
    }

    // Validación en tiempo real de campos del formulario
    document.querySelectorAll('.input-wrapper input, .input-wrapper select').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim() === '' && this.required) {
                this.classList.add('input-error');
                if (this.tagName === 'SELECT') {
                    this.style.color = '#333';
                    this.style.backgroundColor = '#fff5f5';
                }
            } else {
                this.classList.remove('input-error');
                if (this.tagName === 'SELECT') {
                    this.style.backgroundColor = '#f8f9fa';
                    if (!this.value) {
                        this.style.color = 'transparent';
                    }
                }
            }
        });
    });

    // Validación de checkbox términos
    const form = document.getElementById('register-form');
    const checkbox = document.getElementById('agree-term');
    
    form.addEventListener('submit', function(e) {
        if (!checkbox.checked) {
            e.preventDefault();
            // Crear alerta de error
            const alertContainer = document.querySelector('.alert-container');
            const errorToast = document.createElement('div');
            errorToast.className = 'alert-toast error';
            errorToast.innerHTML = `
                <div class="alert-toast-icon">
                    <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                </div>
                <div class="alert-toast-content">
                    <div class="alert-toast-title">Error</div>
                    <div class="alert-toast-message">Debes aceptar los términos de servicio para continuar.</div>
                </div>
                <button class="alert-toast-close">&times;</button>
                <div class="alert-toast-progress" style="color: #e74c3c"></div>
            `;
            alertContainer.appendChild(errorToast);
            
            // Animar la entrada
            setTimeout(() => {
                errorToast.style.transform = 'translateX(0)';
            }, 10);
            
            // Auto-eliminar después de 5 segundos
            setTimeout(() => {
                removeAlertToast(errorToast);
            }, 5000);
            
            // Agregar evento al botón cerrar
            errorToast.querySelector('.alert-toast-close').addEventListener('click', () => {
                removeAlertToast(errorToast);
            });
            
            // Hacer scroll al principio del formulario
            const formContent = document.getElementById('form-content');
            formContent.scrollTop = 0;
        }
    });

    // Función para manejar selects al cargar
    // Forzar que los selects muestren texto cuando tienen valor
    document.querySelectorAll('select').forEach(select => {
        if (select.value) {
            select.style.color = '#333';
            select.classList.add('has-value');
        }
    });
});
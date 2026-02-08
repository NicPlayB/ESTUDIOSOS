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

// Cerrar sidebar al hacer clic en cualquier enlace dentro de él
document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
});

/* ================= MODALES DEL PERFIL ================= */
// Configuración de campos editables (MANTENIENDO LA LÓGICA DEL CÓDIGO 2)
const fieldConfigs = {
    'nombres': {
        label: 'Nombres',
        type: 'text',
        value: window.USUARIO.nombres,
        validation: function(value) {
            const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
            if (!regex.test(value)) {
                return "El nombre solo puede contener letras.";
            }
            return null;
        }
    },
    'apellidos': {
        label: 'Apellidos',
        type: 'text',
        value: window.USUARIO.apellidos,
        validation: function(value) {
            const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
            if (!regex.test(value)) {
                return "Los apellidos solo pueden contener letras.";
            }
            return null;
        }
    },
    'id_tipo_documento': {
        label: 'Tipo de documento',
        type: 'select',
        value: window.USUARIO.id_tipo_documento,
        options: window.TIPOS_DOCUMENTO
    },
    'documento': {
        label: 'Documento',
        type: 'text',
        value: window.USUARIO.documento,
        validation: function(value) {
            if (!/^\d+$/.test(value)) {
                return "El documento solo debe contener números.";
            }
            if (value.length < 6) {
                return "El documento es demasiado corto.";
            }
            return null;
        }
    },
    'pais': {
        label: 'País',
        type: 'select',
        value: window.USUARIO.pais,
        options: window.PAISES,
        validation: function(value) {
            if (!value) {
                return "Debe seleccionar un país.";
            }
            return null;
        }
    },
    'correo': {
        label: 'Correo electrónico',
        type: 'email',
        value: window.USUARIO.correo,
        validation: function(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return "Ingrese un correo electrónico válido.";
            }
            return null;
        }
    },
    'celular': {
        label: 'Celular',
        type: 'text',
        value: window.USUARIO.celular,
        validation: function(value) {
            if (!/^\d+$/.test(value)) {
                return "El celular solo debe contener números.";
            }
            if (value.length < 7 || value.length > 15) {
                return "El celular debe tener entre 7 y 15 dígitos.";
            }
            return null;
        }
    },
    'fecha_nacimiento': {
        label: 'Fecha de nacimiento',
        type: 'date',
        value: window.USUARIO.fecha_nacimiento,
        validation: function(value) {
            const today = new Date().toISOString().split('T')[0];
            if (value > today) {
                return "La fecha de nacimiento no puede ser futura.";
            }
            return null;
        }
    }
};

let currentField = null;

// Función para mostrar error con icono y animación
function showFieldError(message) {
    const errorDiv = document.getElementById('fieldError');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    
    // Reiniciar animación
    errorDiv.style.animation = 'none';
    setTimeout(() => {
        errorDiv.style.animation = 'shakeError 0.5s ease-in-out';
    }, 10);
}

// Función para ocultar error
function hideFieldError() {
    document.getElementById('fieldError').style.display = 'none';
}

function openEditModal(fieldName) {
    currentField = fieldName;
    const config = fieldConfigs[fieldName];
    
    if (!config) return;
    
    // Ocultar cualquier error previo
    hideFieldError();
    
    // Actualizar título y etiqueta del modal
    document.getElementById('modalTitle').innerHTML = `<i class="bi bi-pencil-square me-2"></i>Editar ${config.label}`;
    document.getElementById('fieldLabel').textContent = config.label;
    document.getElementById('fieldName').value = fieldName;
    
    // Generar el input según el tipo
    const container = document.getElementById('fieldInputContainer');
    container.innerHTML = '';
    
    if (config.type === 'select') {
        const select = document.createElement('select');
        select.className = 'form-control';
        select.name = 'field_value';
        select.id = 'fieldValue';
        
        // Agregar opción vacía
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '---------';
        select.appendChild(emptyOption);
        
        config.options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.text;
            if (option.value == config.value) {
                optionEl.selected = true;
            }
            select.appendChild(optionEl);
        });
        
        container.appendChild(select);
    } else {
        const input = document.createElement('input');
        input.type = config.type;
        input.className = 'form-control';
        input.name = 'field_value';
        input.id = 'fieldValue';
        input.value = config.value;
        
        container.appendChild(input);
    }
    
    // Mostrar modal
    document.getElementById('editModal').style.display = 'block';
    document.getElementById('editOverlay').style.display = 'block';
    
    // Enfocar el campo
    setTimeout(() => {
        const field = document.getElementById('fieldValue');
        if (field) field.focus();
    }, 100);
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editOverlay').style.display = 'none';
    currentField = null;
    hideFieldError();
}

/* ================= MODAL DE ÉXITO (IGUAL AL CÓDIGO 1) ================= */
// Función para mostrar el modal de éxito con un mensaje personalizado
function mostrarModalExito(msg) {
    // Establecer el mensaje en el modal
    document.getElementById('mensajeExito').textContent = msg;
    
    // Obtener el elemento del modal
    const modalElement = document.getElementById('modalExito');
    
    // Crear una instancia del modal de Bootstrap
    const modal = new bootstrap.Modal(modalElement);
    
    // Mostrar el modal
    modal.show();
}

// Manejar el envío del formulario de edición
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fieldName = document.getElementById('fieldName').value;
    const fieldValue = document.getElementById('fieldValue').value;
    const config = fieldConfigs[fieldName];
    
    // Ocultar error previo
    hideFieldError();
    
    // Validar si hay validación personalizada
    if (config.validation) {
        const error = config.validation(fieldValue);
        if (error) {
            showFieldError(error);
            return;
        }
    }
    
    // Crear FormData y enviar
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', window.URLS.csrf_token);
    formData.append('field_name', fieldName);
    formData.append('field_value', fieldValue);
    
    fetch(window.URLS.perfil_usuario, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Actualizar el valor mostrado
            const displayElement = document.getElementById(`${fieldName.replace(/_/g, '-')}-value`);
            
            // Para campos select, mostrar el texto de la opción seleccionada
            if (config.type === 'select') {
                const select = document.getElementById('fieldValue');
                const selectedOption = select.options[select.selectedIndex];
                
                // Si es el campo país, actualizamos el valor mostrado con el nombre del país
                if (fieldName === 'pais') {
                    displayElement.textContent = selectedOption.text;
                } else {
                    displayElement.textContent = selectedOption.text;
                }
                
                config.value = fieldValue;
            } else {
                displayElement.textContent = fieldValue;
                config.value = fieldValue;
            }
            
            // Cerrar modal de edición
            closeEditModal();
            
            // Mostrar modal de éxito
            mostrarModalExito('Campo actualizado correctamente');
        } else {
            showFieldError(data.error || 'Error al actualizar');
        }
    })
    .catch(error => {
        showFieldError('Error de conexión con el servidor');
        console.error('Error:', error);
    });
});

// Cerrar modales con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});

// ===== AUTO-CIERRE DE MENSAJES Y MODAL DE ÉXITO =====
// Inicialización cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar automáticamente alertas después de 5 segundos
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert-auto-close');
        alerts.forEach(function(alert) {
            var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        });
    }, 5000);
    
    // Verificar si hay mensajes de éxito para mostrar el modal (desde Django messages)
    if (window.MENSAJES && window.MENSAJES.success) {
        // Usar setTimeout para asegurar que el DOM esté completamente listo
        setTimeout(function() {
            mostrarModalExito(window.MENSAJES.success);
        }, 100);
    }
});

// Función para mostrar notificación de error en tiempo real
function mostrarNotificacionError(titulo, mensaje) {
    // Crear elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show alert-auto-close';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <i class="bi bi-x-circle-fill alert-icon"></i>
        <div>
            <strong>${titulo}</strong>
            <div class="small">${mensaje}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Agregar al contenedor
    const container = document.querySelector('.alert-container');
    container.appendChild(alertDiv);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Función para mostrar error general en el formulario
function mostrarErrorGeneral(mensaje) {
    showFieldError(mensaje);
    
    // Hacer scroll al error
    const errorDiv = document.getElementById('fieldError');
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
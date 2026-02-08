// ================= VARIABLES GLOBALES =================
const USER_ROL = window.USER_ROL;
const CLASE_ID = window.CLASE_ID;
const CSRF_TOKEN = window.CSRF_TOKEN;
const CLASES_VIRTUALES_URL = window.CLASES_VIRTUALES_URL;
let currentClasesCount = 0; // Se actualizará después de cargar el DOM
let socket = null;

// ================= FUNCIONALIDAD DEL NUEVO SISTEMA DE ALERTAS CLEAN (BORDE) =====
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
function setupAlertToasts() {
    const alertToasts = document.querySelectorAll('.alert-toast');
    alertToasts.forEach(toast => {
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
}

// Función para crear una nueva alerta
function createAlertToast(type, title, message) {
    const alertContainer = document.querySelector('.alert-container');
    
    let iconSvg = '';
    let color = '';
    
    switch(type) {
        case 'success':
            iconSvg = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
            color = '#2ecc71';
            break;
        case 'error':
            iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
            color = '#e74c3c';
            break;
        case 'warning':
            iconSvg = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
            color = '#f1c40f';
            break;
        case 'info':
        default:
            iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
            color = '#3498db';
            break;
    }
    
    const alertToast = document.createElement('div');
    alertToast.className = `alert-toast ${type}`;
    alertToast.innerHTML = `
        <div class="alert-toast-icon">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                ${iconSvg}
            </svg>
        </div>
        <div class="alert-toast-content">
            <div class="alert-toast-title">${title}</div>
            <div class="alert-toast-message">${message}</div>
        </div>
        <button class="alert-toast-close">&times;</button>
        <div class="alert-toast-progress" style="color: ${color}"></div>
    `;
    
    alertContainer.appendChild(alertToast);
    
    // Agregar funcionalidad al botón de cierre
    const closeBtn = alertToast.querySelector('.alert-toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            removeAlertToast(alertToast);
        });
    }
    
    // Auto-cierre después de 5 segundos
    setTimeout(() => {
        removeAlertToast(alertToast);
    }, 5000);
}

// ================= SIDEBAR =================
function initializeSidebar() {
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

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', closeNav);
    });
}

// ================= WEBSOCKET =================
function initializeWebSocket() {
    if (!window.WEBSOCKET_URL) {
        console.error("WEBSOCKET_URL no está definida");
        return;
    }

    try {
        socket = new WebSocket(window.WEBSOCKET_URL);

        socket.onopen = () => {
            console.log("✅ Conexión WebSocket establecida para clases virtuales");
            updateWebSocketStatus('connected', 'Conectado en tiempo real');
        };
        
        socket.onclose = () => {
            console.log("❌ Conexión WebSocket cerrada");
            updateWebSocketStatus('disconnected', 'Desconectado');
            
            setTimeout(() => {
                location.reload();
            }, 3000);
        };

        socket.onerror = (error) => {
            console.error("❌ Error en WebSocket:", error);
        };

        socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if(data.action === "refresh") {
                    console.log("📡 Actualización recibida:", data.count, "clases virtuales");
                    
                    const listaDiv = document.querySelector('.clases-virtuales-container');
                    if (listaDiv) {
                        listaDiv.innerHTML = data.html;
                        
                        // Ocultar botones si el usuario no es rol 3
                        if (USER_ROL != 3) {
                            listaDiv.querySelectorAll('.btn-editar-clase, .btn-eliminar-clase').forEach(btn => {
                                btn.style.display = 'none';
                            });
                        }
                    }
                    
                    const countElement = document.getElementById('clasesVirtualesCount');
                    if (countElement) {
                        const plural = data.count !== 1 ? 's' : '';
                        countElement.innerHTML = `<i class="bi bi-camera-video me-1"></i>${data.count} clase${plural}`;
                    }
                    
                    if (data.count > currentClasesCount) {
                        showNewClaseVirtualNotification();
                    }
                    
                    currentClasesCount = data.count;
                    
                    setupEventListeners();
                    
                    if (data.count > 0) {
                        const cards = document.querySelectorAll('.card-clase-virtual');
                        if (cards.length > 0) {
                            cards[cards.length - 1].classList.add('new-clase-virtual');
                            setTimeout(() => {
                                cards[cards.length - 1].classList.remove('new-clase-virtual');
                            }, 2000);
                        }
                    }
                }
            } catch (err) {
                console.error("Error al procesar mensaje WebSocket:", err);
            }
        };
    } catch (err) {
        console.error("Error al crear WebSocket:", err);
    }
}

// ================= FUNCIONES AUXILIARES =================
function updateWebSocketStatus(status, message) {
    const statusDiv = document.getElementById('wsStatus');
    const statusText = document.getElementById('wsStatusText');
    
    if (statusDiv && statusText) {
        statusDiv.style.display = 'block';
        statusDiv.className = 'ws-status ws-' + status;
        statusText.textContent = message;
    }
}

function showNewClaseVirtualNotification() {
    createAlertToast('success', 'Nueva Clase Virtual', '¡Nueva clase virtual programada!');
}

function limpiarErroresFormulario(formElement) {
    if (!formElement) return;
    
    formElement.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    formElement.querySelectorAll('.error-text').forEach(el => {
        el.style.display = 'none';
        el.innerHTML = '';
    });
}

function limpiarFormularioCompletamente(formElement) {
    if (!formElement) return;
    
    limpiarErroresFormulario(formElement);
    formElement.reset();
    
    formElement.querySelectorAll('input, textarea, select').forEach(input => {
        input.classList.remove('is-invalid');
        const errorDiv = input.parentNode.querySelector('.error-text');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.innerHTML = '';
        }
    });
}

function mostrarErroresFormulario(formElement, errores) {
    limpiarErroresFormulario(formElement);
    
    for (const [campo, mensajes] of Object.entries(errores)) {
        const input = formElement.querySelector(`[name="${campo}"]`);
        if (input) {
            input.classList.add('is-invalid');
            
            const errorDivId = `error-${campo}-${formElement.id.replace('form', '').toLowerCase()}`;
            let errorDiv = document.getElementById(errorDivId);
            
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'error-text';
                errorDiv.id = errorDivId;
                input.parentNode.appendChild(errorDiv);
            }
            
            errorDiv.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${mensajes[0]}`;
            errorDiv.style.display = 'block';
        }
    }
}

function mostrarErrorGeneral(mensaje) {
    createAlertToast('error', 'Error', mensaje);
}

function mostrarModalExito(mensaje) {
    if (mensaje) {
        document.getElementById('mensajeExito').textContent = mensaje;
    }
    
    setTimeout(function() {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(function(backdrop) {
            backdrop.remove();
        });
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        const modalElement = document.getElementById('modalExito');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }, 100);
}

function setupEventListeners() {
    // Botones de editar - solo para rol 3
    if (USER_ROL == 3) {
        document.querySelectorAll('.btn-editar-clase').forEach(button => {
            button.addEventListener('click', function() {
                const claseId = this.getAttribute('data-clase-id');
                const descripcion = this.getAttribute('data-descripcion');
                const fecha = this.getAttribute('data-fecha');
                const url = this.getAttribute('data-url');
                
                document.getElementById('editClaseId').value = claseId;
                document.getElementById('editDescripcion').value = descripcion;
                document.getElementById('editFecha').value = fecha;
                document.getElementById('editUrl').value = url;
                
                limpiarErroresFormulario(document.getElementById('formEditar'));
                
                const modalElement = document.getElementById('modalEditar');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            });
        });
        
        // Botones de eliminar - solo para rol 3
        document.querySelectorAll('.btn-eliminar-clase').forEach(button => {
            button.addEventListener('click', function() {
                const claseId = this.getAttribute('data-clase-id');
                const descripcion = this.getAttribute('data-descripcion');
                
                document.getElementById('eliminarClaseId').value = claseId;
                document.getElementById('eliminarDescripcion').textContent = descripcion;
                
                const modalElement = document.getElementById('modalEliminar');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            });
        });
    } else {
        // Ocultar botones si no es rol 3
        document.querySelectorAll('.btn-editar-clase, .btn-eliminar-clase').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// ================= MANEJO DE FORMULARIOS =================
function initializeFormHandlers() {
    // Formulario de crear
    const formCrear = document.getElementById('formCrear');
    const submitCrear = document.getElementById('submitCrear');
    
    formCrear?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        limpiarErroresFormulario(formCrear);
        
        const originalText = submitCrear.innerHTML;
        submitCrear.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando...';
        submitCrear.disabled = true;
        
        try {
            const formData = new FormData(formCrear);
            
            const response = await fetch(CLASES_VIRTUALES_URL, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': CSRF_TOKEN
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                limpiarFormularioCompletamente(formCrear);
                submitCrear.innerHTML = originalText;
                submitCrear.disabled = false;
                
                setTimeout(() => {
                    const modalElement = document.getElementById('modalCrear');
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                        }
                    }
                    
                    mostrarModalExito(data.message || 'Clase virtual creada correctamente');
                }, 100);
            } else {
                mostrarErroresFormulario(formCrear, data.errors);
                submitCrear.innerHTML = originalText;
                submitCrear.disabled = false;
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            submitCrear.innerHTML = originalText;
            submitCrear.disabled = false;
            mostrarErrorGeneral('Error de conexión al servidor. Por favor, intenta nuevamente.');
        }
    });
    
    // Formulario de editar
    const formEditar = document.getElementById('formEditar');
    const submitEditar = document.getElementById('submitEditar');
    
    formEditar?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        limpiarErroresFormulario(formEditar);
        
        const originalText = submitEditar.innerHTML;
        submitEditar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
        submitEditar.disabled = true;
        
        try {
            const formData = new FormData(formEditar);
            
            const response = await fetch(CLASES_VIRTUALES_URL, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': CSRF_TOKEN
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                submitEditar.innerHTML = originalText;
                submitEditar.disabled = false;
                
                setTimeout(() => {
                    const modalElement = document.getElementById('modalEditar');
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                        }
                    }
                    
                    mostrarModalExito(data.message || 'Clase virtual actualizada correctamente');
                }, 100);
            } else {
                mostrarErroresFormulario(formEditar, data.errors);
                submitEditar.innerHTML = originalText;
                submitEditar.disabled = false;
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            submitEditar.innerHTML = originalText;
            submitEditar.disabled = false;
            mostrarErrorGeneral('Error de conexión al servidor. Por favor, intenta nuevamente.');
        }
    });
    
    // Formulario de eliminar
    const formEliminar = document.getElementById('formEliminar');
    const submitEliminar = document.getElementById('submitEliminar');
    
    formEliminar?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const originalText = submitEliminar.innerHTML;
        submitEliminar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...';
        submitEliminar.disabled = true;
        
        try {
            const formData = new FormData(formEliminar);
            
            const response = await fetch(CLASES_VIRTUALES_URL, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': CSRF_TOKEN
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                submitEliminar.innerHTML = originalText;
                submitEliminar.disabled = false;
                
                setTimeout(() => {
                    const modalElement = document.getElementById('modalEliminar');
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                        }
                    }
                    
                    mostrarModalExito(data.message || 'Clase virtual eliminada correctamente');
                }, 100);
            } else {
                mostrarErrorGeneral(data.message || 'Error al eliminar la clase virtual');
                
                const modalElement = document.getElementById('modalEliminar');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
                
                submitEliminar.innerHTML = originalText;
                submitEliminar.disabled = false;
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            submitEliminar.innerHTML = originalText;
            submitEliminar.disabled = false;
            mostrarErrorGeneral('Error de conexión al servidor. Por favor, intenta nuevamente.');
        }
    });
}

// ================= INICIALIZACIÓN =================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de clases virtuales...');
    console.log('Rol del usuario:', USER_ROL);
    console.log('ID de la clase:', CLASE_ID);
    
    // Configurar sistema de alertas
    setupAlertToasts();
    
    // Inicializar sidebar
    initializeSidebar();
    
    // Inicializar contador de clases actuales
    const clasesVirtualesList = document.querySelector('.clases-virtuales-container');
    if (clasesVirtualesList) {
        currentClasesCount = clasesVirtualesList.querySelectorAll('.card-clase-virtual').length;
    }
    
    // Configurar event listeners para botones de editar/eliminar
    setupEventListeners();
    
    // Inicializar WebSocket
    initializeWebSocket();
    
    // Inicializar manejadores de formularios
    initializeFormHandlers();
    
    // Ocultar botones de editar/eliminar si no es rol 3
    if (USER_ROL != 3) {
        document.querySelectorAll('.btn-editar-clase, .btn-eliminar-clase').forEach(btn => {
            btn.style.display = 'none';
        });
    }
    
    // Limpiar formulario de crear al abrir el modal
    const modalCrearElement = document.getElementById('modalCrear');
    if (modalCrearElement) {
        modalCrearElement.addEventListener('show.bs.modal', function() {
            limpiarFormularioCompletamente(document.getElementById('formCrear'));
        });
        
        modalCrearElement.addEventListener('hidden.bs.modal', function() {
            limpiarFormularioCompletamente(document.getElementById('formCrear'));
        });
    }
    
    // Limpiar formulario de editar al abrir el modal
    const modalEditarElement = document.getElementById('modalEditar');
    if (modalEditarElement) {
        modalEditarElement.addEventListener('show.bs.modal', function() {
            limpiarErroresFormulario(document.getElementById('formEditar'));
        });
        
        modalEditarElement.addEventListener('hidden.bs.modal', function() {
            limpiarErroresFormulario(document.getElementById('formEditar'));
        });
    }
    
    // Asegurar que todos los inputs tengan la clase form-control
    const formInputs = document.querySelectorAll('.modal-form input[type="text"], .modal-form input[type="url"], .modal-form textarea');
    formInputs.forEach(function(input) {
        if (!input.classList.contains('form-control')) {
            input.classList.add('form-control');
        }
    });
});

// Limpiar WebSocket al cerrar la página
window.addEventListener('beforeunload', function() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
});
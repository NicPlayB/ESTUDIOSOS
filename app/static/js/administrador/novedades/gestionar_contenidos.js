// static/js/gestion_contenidos.js

// ===== VARIABLES GLOBALES =====
let contenidoAEliminar = null;
let filtroActual = 'todos';
let contenidosData = [];

// ===== MANEJO DEL SIDEBAR RESPONSIVE =====
document.addEventListener('DOMContentLoaded', function() {
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

    // Inicializar elementos del DOM
    initializeElements();
});

// ===== FUNCIÓN PARA INICIALIZAR ELEMENTOS =====
function initializeElements() {
    // Elementos del DOM
    const tipoSelect = document.getElementById('id_tipo');
    const imagenBox = document.getElementById('imagen-box');
    const iconosBox = document.getElementById('iconos-box');
    const fechaInicioBox = document.getElementById('fecha-inicio-box');
    const fechaFinBox = document.getElementById('fecha-fin-box');
    const iconInput = document.getElementById('id_icono');
    const contenidoIdInput = document.getElementById('contenido_id');
    const modalTitulo = document.getElementById('modalTitulo');
    const imagenPreview = document.getElementById('imagen-preview');
    const previewImg = document.getElementById('preview-img');
    const imagenInput = document.getElementById('id_imagen');
    const dropZoneContenido = document.getElementById('dropZoneContenido');
    const filePreviewContenido = document.getElementById('filePreviewContenido');
    const infoPanelDefault = document.getElementById('infoPanelDefault');
    const formColumnsWide = document.getElementById('formColumnsWide');
    const contenidosContainer = document.getElementById('contenidosContainer');
    const noContenidosContainer = document.getElementById('noContenidosContainer');
    const filtroButtons = document.querySelectorAll('.filtro-btn');

    // Configurar campo de tipo si existe
    if (tipoSelect) {
        // Asegurar que tenga ID
        if (!tipoSelect.id) {
            tipoSelect.id = 'tipo-select';
        }
        
        // Inicializar visibilidad de campos
        toggleFieldsByType();
        
        // Configurar evento change
        tipoSelect.addEventListener('change', toggleFieldsByType);
    }

    // Preview de imagen
    if (imagenInput) {
        // Configurar zona de arrastre
        if (dropZoneContenido) {
            dropZoneContenido.addEventListener('click', () => {
                imagenInput.click();
            });

            dropZoneContenido.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZoneContenido.classList.add('dragover');
            });

            dropZoneContenido.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZoneContenido.classList.remove('dragover');
            });

            dropZoneContenido.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZoneContenido.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const file = files[0];
                    handleFileSelection(file);
                    
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    imagenInput.files = dataTransfer.files;
                }
            });
        }
        
        imagenInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleFileSelection(file);
            }
        });
    }

    // Selección de iconos
    document.querySelectorAll('.icon-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.icon-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const iconInput = document.getElementById('id_icono');
            if (iconInput) iconInput.value = item.dataset.icon;
        });
    });

    // Configurar eventos de los botones de filtro
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tipo = btn.dataset.tipo;
            aplicarFiltro(tipo);
        });
    });

    // Editar contenido
    document.querySelectorAll('.editar').forEach(btn => {
        btn.addEventListener('click', function() {
            const contenidoId = this.dataset.id;
            editarContenido(contenidoId);
        });
    });

    // Confirmación para eliminar
    document.querySelectorAll('.eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            contenidoAEliminar = this.dataset.id;
            document.getElementById('delete-titulo').textContent = this.dataset.titulo;
            
            const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
            modal.show();
        });
    });

    // ELIMINAR CONTENIDO
    document.getElementById('confirm-delete-btn').addEventListener('click', function() {
        if (contenidoAEliminar) {
            eliminarContenido(contenidoAEliminar);
        }
    });

    // ENVÍO DEL FORMULARIO
    const contenidoForm = document.getElementById('contenidoForm');
    if (contenidoForm) {
        contenidoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarContenido(this);
        });
    }

    // Verificar si hay contenido inicial
    const tarjetasIniciales = document.querySelectorAll('.contenido-card');
    if (tarjetasIniciales.length === 0) {
        noContenidosContainer.classList.remove('hidden');
    }

    // Auto-focus en el primer campo del formulario cuando se abre el modal
    const contenidoModal = document.getElementById('contenidoModal');
    if (contenidoModal) {
        contenidoModal.addEventListener('shown.bs.modal', function () {
            const firstInput = contenidoModal.querySelector('input[name="titulo"]');
            if (firstInput) firstInput.focus();
        });
    }
}

// ===== FUNCIÓN PARA FORMATEAR MENSAJES DE ERROR CON ÍCONO =====
function formatoError(mensaje) {
    return `<i class="bi bi-exclamation-triangle"></i><span class="error-message">${mensaje}</span>`;
}

// ===== FUNCIÓN PARA ELIMINAR ALERTAS =====
function removeAlertToast(toastElement) {
    if (!toastElement.parentElement) return;
    
    toastElement.classList.add('hide');
    
    toastElement.addEventListener('animationend', () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    });
}

// ===== MOSTRAR ALERTA (solo para errores, advertencias e información) =====
function mostrarAlerta(tipo, titulo, mensaje) {
    // Solo mostrar alertas para errores, advertencias e información
    if (tipo === 'success') return;
    
    const alertContainer = document.querySelector('.alert-container');
    const alertId = 'alert-' + Date.now();
    
    let iconSvg = '';
    let colorVar = '';
    let iconColor = '';
    
    switch(tipo) {
        case 'error':
            // Cambiado a triángulo de exclamación para errores
            iconSvg = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            colorVar = 'var(--alert-error)';
            iconColor = '#e74c3c';
            break;
        case 'warning':
            iconSvg = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            colorVar = 'var(--alert-warning)';
            iconColor = '#f1c40f';
            break;
        case 'info':
            iconSvg = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
            colorVar = 'var(--alert-info)';
            iconColor = '#3498db';
            break;
        default:
            return; // No mostrar para success
    }
    
    const alertHTML = `
        <div id="${alertId}" class="alert-toast ${tipo}">
            <div class="alert-toast-icon" style="color: ${iconColor}">
                ${iconSvg}
            </div>
            <div class="alert-toast-content">
                <div class="alert-toast-title">${titulo}</div>
                <div class="alert-toast-message">${mensaje}</div>
            </div>
            <button class="alert-toast-close" onclick="removeAlertToast(this.parentElement)">&times;</button>
            <div class="alert-toast-progress" style="color: ${colorVar}"></div>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('afterbegin', alertHTML);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            removeAlertToast(alert);
        }
    }, 5000);
}

// ===== MOSTRAR MODAL DE ÉXITO =====
function mostrarModalExito(mensaje) {
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = mensaje;
    
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
    
    // Configurar para recargar al cerrar el modal
    const successModalElement = document.getElementById('successModal');
    const acceptBtn = document.getElementById('accept-success-btn');
    
    // Remover listeners previos para evitar duplicados
    const newAcceptBtn = acceptBtn.cloneNode(true);
    acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
    
    // Agregar nuevo listener al botón Aceptar
    newAcceptBtn.addEventListener('click', function() {
        location.reload();
    });
    
    // También recargar si se cierra el modal con la X o fuera
    successModalElement.addEventListener('hidden.bs.modal', function() {
        location.reload();
    }, { once: true });
}

// ===== VER IMAGEN COMPLETA =====
function verImagenCompleta(imageUrl) {
    const fullImage = document.getElementById('fullImage');
    fullImage.src = imageUrl;
    
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
}

// ===== SISTEMA DE FILTROS =====

// Función para aplicar filtro
function aplicarFiltro(tipo) {
    const filtroButtons = document.querySelectorAll('.filtro-btn');
    
    // Actualizar botones activos
    filtroButtons.forEach(btn => {
        if (btn.dataset.tipo === tipo) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    filtroActual = tipo;
    
    // Obtener todas las tarjetas
    const tarjetas = document.querySelectorAll('.contenido-card');
    let tarjetasVisibles = 0;
    
    // Mostrar/ocultar según el filtro
    tarjetas.forEach(tarjeta => {
        if (tipo === 'todos' || tarjeta.dataset.tipo === tipo) {
            tarjeta.style.display = 'flex';
            tarjetasVisibles++;
        } else {
            tarjeta.style.display = 'none';
        }
    });
    
    const contenidosContainer = document.getElementById('contenidosContainer');
    const noContenidosContainer = document.getElementById('noContenidosContainer');
    
    // Mostrar mensaje si no hay resultados
    if (tarjetasVisibles === 0) {
        contenidosContainer.classList.add('hidden');
        noContenidosContainer.classList.remove('hidden');
    } else {
        contenidosContainer.classList.remove('hidden');
        noContenidosContainer.classList.add('hidden');
    }
}

// ===== FUNCIONES PARA CONTENIDO =====

// Función para resetear campos
function resetFields(){
    const imagenBox = document.getElementById('imagen-box');
    const iconosBox = document.getElementById('iconos-box');
    const fechaInicioBox = document.getElementById('fecha-inicio-box');
    const fechaFinBox = document.getElementById('fecha-fin-box');
    const imagenPreview = document.getElementById('imagen-preview');
    const iconInput = document.getElementById('id_icono');
    
    if (imagenBox) imagenBox.classList.add('hidden');
    if (iconosBox) iconosBox.classList.add('hidden');
    if (fechaInicioBox) fechaInicioBox.classList.add('hidden');
    if (fechaFinBox) fechaFinBox.classList.add('hidden');
    if (imagenPreview) imagenPreview.classList.add('hidden');
    document.querySelectorAll('.icon-item').forEach(i => i.classList.remove('selected'));
    if (iconInput) iconInput.value = '';
    clearErrors();
}

// Función para nuevo contenido
function nuevoContenido() {
    const contenidoIdInput = document.getElementById('contenido_id');
    const modalTitulo = document.getElementById('modalTitulo');
    const infoPanelDefault = document.getElementById('infoPanelDefault');
    const dropZoneContenido = document.getElementById('dropZoneContenido');
    const filePreviewContenido = document.getElementById('filePreviewContenido');
    const formColumnsWide = document.getElementById('formColumnsWide');
    
    if (contenidoIdInput) contenidoIdInput.value = 'none';
    if (modalTitulo) modalTitulo.textContent = 'Crear Nuevo Contenido';
    
    const contenidoForm = document.getElementById('contenidoForm');
    if (contenidoForm) contenidoForm.reset();
    
    resetFields();
    
    // Mostrar panel informativo por defecto
    if (infoPanelDefault) {
        infoPanelDefault.classList.remove('hidden');
    }
    
    // Configurar drop zone
    if (dropZoneContenido) {
        const dropText = dropZoneContenido.querySelector('.drop-text');
        const dropSubtext = dropZoneContenido.querySelector('.drop-subtext');
        const dropIcon = dropZoneContenido.querySelector('i');
        
        if (dropIcon) dropIcon.style.color = '#adb5bd';
        if (dropText) dropText.innerHTML = 'Arrastra y suelta la imagen aquí';
        if (dropSubtext) dropSubtext.innerHTML = 'o haz clic para seleccionar';
        
        if (filePreviewContenido) {
            filePreviewContenido.style.display = 'none';
        }
    }
    
    // Mostrar dos columnas por defecto
    if (formColumnsWide) {
        formColumnsWide.classList.remove('single-column');
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('contenidoModal'));
    modal.show();
}

// Limpiar errores
function clearErrors() {
    document.querySelectorAll('.error-text').forEach(e => {
        e.innerHTML = '';
        e.classList.remove('show');
    });
    // También quitar clases de invalid de los campos
    document.querySelectorAll('.form-control, .form-select').forEach(field => {
        field.classList.remove('is-invalid');
    });
}

// Mostrar/ocultar campos según tipo
function toggleFieldsByType() {
    resetFields();
    clearErrors();
    
    const infoPanelDefault = document.getElementById('infoPanelDefault');
    const formColumnsWide = document.getElementById('formColumnsWide');
    const tipoSelect = document.getElementById('id_tipo');
    
    if (!tipoSelect) return;
    
    // Ocultar panel informativo por defecto
    if (infoPanelDefault) {
        infoPanelDefault.classList.add('hidden');
    }
    
    // Mostrar dos columnas por defecto
    if (formColumnsWide) {
        formColumnsWide.classList.remove('single-column');
    }
    
    if (tipoSelect.value === 'noticia'){
        const imagenBox = document.getElementById('imagen-box');
        if (imagenBox) imagenBox.classList.remove('hidden');
        // Mantener dos columnas
    } else if (tipoSelect.value === 'inscripcion'){
        const fechaInicioBox = document.getElementById('fecha-inicio-box');
        const fechaFinBox = document.getElementById('fecha-fin-box');
        if (fechaInicioBox) fechaInicioBox.classList.remove('hidden');
        if (fechaFinBox) fechaFinBox.classList.remove('hidden');
        // Cambiar a una columna (solo formulario, sin elementos en derecha)
        if (formColumnsWide) {
            formColumnsWide.classList.add('single-column');
        }
    } else if (tipoSelect.value === 'curso'){
        const iconosBox = document.getElementById('iconos-box');
        const fechaInicioBox = document.getElementById('fecha-inicio-box');
        if (iconosBox) iconosBox.classList.remove('hidden');
        if (fechaInicioBox) fechaInicioBox.classList.remove('hidden');
        // Mantener dos columnas
    } else {
        // Para cualquier otro tipo, mostrar solo panel informativo
        if (infoPanelDefault) {
            infoPanelDefault.classList.remove('hidden');
        }
        if (formColumnsWide) {
            formColumnsWide.classList.add('single-column');
        }
    }
}

// Función para manejar la selección de archivos
function handleFileSelection(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
        mostrarAlerta('error', '¡Error!', 'Tipo de archivo no permitido. Por favor, sube una imagen JPG, JPEG o PNG.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        mostrarAlerta('error', '¡Error!', 'La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('preview-img');
        const imagenPreview = document.getElementById('imagen-preview');
        const filePreviewContenido = document.getElementById('filePreviewContenido');
        const dropZoneContenido = document.getElementById('dropZoneContenido');
        
        if (previewImg) previewImg.src = e.target.result;
        if (imagenPreview) imagenPreview.classList.remove('hidden');
        
        if (filePreviewContenido) {
            const previewHTML = `
                <div class="file-preview-item uploaded" id="filePreviewItemContenido">
                    <div class="file-info">
                        <i class="bi bi-file-earmark-image" style="color: #F39C12; font-size: 1.4rem;"></i>
                        <div style="flex: 1; min-width: 0;">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <div class="file-status">
                        <span class="upload-success"><i class="bi bi-check-circle"></i> Lista para subir</span>
                    </div>
                </div>
            `;
            
            filePreviewContenido.innerHTML = previewHTML;
            filePreviewContenido.style.display = 'block';
        }
        
        if (dropZoneContenido) {
            const dropText = dropZoneContenido.querySelector('.drop-text');
            const dropSubtext = dropZoneContenido.querySelector('.drop-subtext');
            const dropIcon = dropZoneContenido.querySelector('i');
            
            if (dropIcon) dropIcon.style.color = 'var(--primary-orange)';
            if (dropText) dropText.innerHTML = `<span style="color: var(--primary-orange); font-weight: 600;">Imagen seleccionada</span>`;
            if (dropSubtext) dropSubtext.innerHTML = `<span style="color: var(--primary-orange);">${file.name}</span>`;
        }
    };
    reader.readAsDataURL(file);
}

// Función para formatear el tamaño del archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Editar contenido
function editarContenido(contenidoId) {
    fetch(`?editar=${contenidoId}`, {
        headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            const contenido = data.data;
            const contenidoIdInput = document.getElementById('contenido_id');
            const modalTitulo = document.getElementById('modalTitulo');
            const iconInput = document.getElementById('id_icono');
            const previewImg = document.getElementById('preview-img');
            const imagenPreview = document.getElementById('imagen-preview');
            const tipoSelect = document.getElementById('id_tipo');
            
            // Llenar formulario
            if (contenidoIdInput) contenidoIdInput.value = contenido.id;
            if (modalTitulo) modalTitulo.textContent = 'Editar Contenido';
            
            const tipoField = document.getElementById('id_tipo');
            const tituloField = document.getElementById('id_titulo');
            const descripcionField = document.getElementById('id_descripcion');
            const fechaInicioField = document.getElementById('id_fecha_inicio');
            const fechaFinField = document.getElementById('id_fecha_fin');
            
            if (tipoField) tipoField.value = contenido.tipo;
            if (tituloField) tituloField.value = contenido.titulo;
            if (descripcionField) descripcionField.value = contenido.descripcion;
            
            // Icono
            if (contenido.icono && iconInput) {
                iconInput.value = contenido.icono;
                document.querySelectorAll('.icon-item').forEach(item => {
                    if (item.dataset.icon === contenido.icono) {
                        item.classList.add('selected');
                    }
                });
            }
            
            // Fechas
            if (contenido.fecha_inicio && fechaInicioField) {
                fechaInicioField.value = contenido.fecha_inicio;
            }
            if (contenido.fecha_fin && fechaFinField) {
                fechaFinField.value = contenido.fecha_fin;
            }
            
            // Imagen preview
            if (contenido.imagen_url && previewImg) {
                previewImg.src = contenido.imagen_url;
                if (imagenPreview) imagenPreview.classList.remove('hidden');
            }
            
            // Mostrar campos según tipo
            if (tipoSelect) {
                tipoSelect.dispatchEvent(new Event('change'));
            }
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('contenidoModal'));
            modal.show();
        } else {
            mostrarAlerta('error', '¡Error!', 'No se pudo cargar el contenido para editar.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('error', '¡Error!', 'Ocurrió un error al intentar editar el contenido.');
    });
}

// ===== ELIMINAR CONTENIDO =====
function eliminarContenido(contenidoId) {
    fetch(`?eliminar=${contenidoId}`, {
        headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            // Cerrar modal de confirmación inmediatamente
            const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
            confirmModal.hide();
            
            // Mostrar modal de éxito
            mostrarModalExito('Contenido eliminado correctamente.');
        } else {
            mostrarAlerta('error', '¡Error!', data.error || 'No se pudo eliminar el contenido.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('error', '¡Error!', 'Ocurrió un error al intentar eliminar el contenido.');
    });
}

// ===== GUARDAR CONTENIDO =====
function guardarContenido(form) {
    const formData = new FormData(form);
    
    // Asegurar que el CSRF token esté incluido
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        formData.append('csrfmiddlewaretoken', csrfToken.value);
    }
    
    fetch('', {
        method: 'POST',
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        clearErrors();
        
        if (data.success) {
            // Cerrar el modal del formulario inmediatamente
            const contenidoModal = bootstrap.Modal.getInstance(document.getElementById('contenidoModal'));
            contenidoModal.hide();
            
            // Mostrar modal de éxito inmediatamente
            mostrarModalExito(data.message);
        } else {
            // Mostrar errores en los campos
            for (let field in data.errors) {
                const errorDiv = document.getElementById(`error-${field}`);
                const inputField = document.getElementById(`id_${field}`);
                
                if (errorDiv && data.errors[field][0]) {
                    errorDiv.innerHTML = formatoError(data.errors[field][0]);
                    errorDiv.classList.add('show');
                    
                    // Agregar animación para mostrar el error
                    setTimeout(() => {
                        errorDiv.style.opacity = '1';
                        errorDiv.style.transform = 'translateY(0)';
                    }, 10);
                }
                
                if (inputField) {
                    inputField.classList.add('is-invalid');
                }
            }
            
            // Mostrar alerta si hay errores generales
            if (data.error) {
                mostrarAlerta('error', '¡Error!', data.error);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarAlerta('error', '¡Error!', 'Ocurrió un error al guardar el contenido.');
    });
}

// Hacer funciones disponibles globalmente
window.nuevoContenido = nuevoContenido;
window.verImagenCompleta = verImagenCompleta;
window.mostrarAlerta = mostrarAlerta;
window.mostrarModalExito = mostrarModalExito;
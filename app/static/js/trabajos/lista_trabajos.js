/* ================= SIDEBAR ================= */
// Funcionalidad para mostrar/ocultar el sidebar en dispositivos móviles
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarNav = document.querySelector('.sidebar-nav');
const navOverlay = document.getElementById('navOverlay');

// Función para alternar (mostrar/ocultar) el sidebar
function toggleNav() {
    sidebarNav.classList.toggle('show');
    navOverlay.classList.toggle('show');
    hamburgerBtn.classList.toggle('hide');
}

// Función para cerrar el sidebar
function closeNav() {
    sidebarNav.classList.remove('show');
    navOverlay.classList.remove('show');
    hamburgerBtn.classList.remove('hide');
}

// Event listeners para el botón hamburguesa y el overlay
hamburgerBtn?.addEventListener('click', toggleNav);
navOverlay?.addEventListener('click', closeNav);

// Cerrar sidebar al hacer clic en cualquier enlace dentro de él
document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
});

/* ================= NUEVO JAVASCRIPT PARA ALERTAS CLEAN (BORDE) ================= */
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

// Auto-cierre después de 5 segundos y agregar funcionalidad de cierre
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Verificar si hay mensajes de éxito para mostrar el modal (desde Django messages)
    if (typeof DJANGO_DATA !== 'undefined') {
        DJANGO_DATA.messages.forEach(message => {
            if (message.tags === 'success') {
                // Usar setTimeout para asegurar que el DOM esté completamente listo
                setTimeout(function() {
                    mostrarModalExito(message.message);
                }, 100);
            }
        });
    }
});

/* ================= FORMULARIO FLOTANTE ================= */
// Referencias a elementos del formulario flotante
const openFloatingBtn = document.getElementById('openFloatingForm');
const closeFloatingBtn = document.getElementById('closeFloatingForm');
const floatingFormOverlay = document.getElementById('floatingFormOverlay');
const floatingForm = document.getElementById('floatingForm');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const trabajoForm = document.getElementById('trabajoForm');
const submitBtn = document.getElementById('submitBtn');
const fileCountBadge = document.getElementById('fileCountBadge');

// Variables para manejar archivos seleccionados
let selectedFiles = [];
let fileIdCounter = 0;
let isAddingFiles = false; // Bandera para evitar duplicación

// Abrir formulario flotante al hacer clic en el botón "+"
openFloatingBtn?.addEventListener('click', () => {
    floatingFormOverlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll en el fondo
});

// Cerrar formulario flotante al hacer clic en la "X"
closeFloatingBtn?.addEventListener('click', () => {
    floatingFormOverlay.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restaurar scroll
    // Limpiar archivos seleccionados al cerrar
    selectedFiles = [];
    updateFileInput();
    updateFilePreview();
});

// Cerrar formulario flotante al hacer clic fuera de él (en el overlay)
floatingFormOverlay.addEventListener('click', e => {
    if (e.target === floatingFormOverlay) {
        floatingFormOverlay.classList.remove('show');
        document.body.style.overflow = 'auto';
        // Limpiar archivos seleccionados al cerrar
        selectedFiles = [];
        updateFileInput();
        updateFilePreview();
    }
});

// Prevenir que el clic dentro del formulario cierre el overlay
floatingForm.addEventListener('click', e => e.stopPropagation());

/* ================= MANEJO DE ARCHIVOS ================= */
// Actualizar el badge con la cantidad de archivos seleccionados
function actualizarContadorArchivos() {
    fileCountBadge.style.display = selectedFiles.length ? 'flex' : 'none';
    fileCountBadge.textContent = selectedFiles.length;
}

// Actualizar el input de archivos con los archivos seleccionados
function updateFileInput() {
    const dt = new DataTransfer();
    selectedFiles.forEach(f => dt.items.add(f.file));
    fileInput.files = dt.files;
    actualizarContadorArchivos();
}

// Función para agregar archivos evitando duplicados
function addFiles(files) {
    if (isAddingFiles) return;
    isAddingFiles = true;
    
    const newFiles = Array.from(files);
    let addedCount = 0;
    
    newFiles.forEach(file => {
        // Verificar si el archivo ya existe (por nombre y tamaño)
        const fileExists = selectedFiles.some(f => 
            f.file.name === file.name && 
            f.file.size === file.size
        );
        
        if (!fileExists) {
            fileIdCounter++;
            selectedFiles.push({ 
                id: `file_${fileIdCounter}`, 
                file,
                uniqueId: `${file.name}_${file.size}_${file.lastModified}`
            });
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        updateFileInput();
        updateFilePreview();
        
        // Mostrar mensaje temporal de éxito
        const dropText = dropZone.querySelector('.drop-text');
        const originalText = dropText.textContent;
        dropText.innerHTML = `<span style="color: var(--primary-orange);">${addedCount} archivo(s) agregado(s)</span>`;
        
        // Restaurar texto después de 3 segundos
        setTimeout(() => {
            dropText.textContent = originalText;
        }, 3000);
    }
    
    isAddingFiles = false;
}

// Función para eliminar archivos de la lista
function eliminarArchivoDeLista(id) {
    selectedFiles = selectedFiles.filter(f => f.id !== id);
    updateFileInput();
    updateFilePreview();
}

// Función para actualizar la vista previa de archivos
function updateFilePreview() {
    filePreview.innerHTML = '';
    
    if (selectedFiles.length === 0) {
        filePreview.innerHTML = '<p class="text-muted small m-0">Arrastra o selecciona archivos para cargarlos</p>';
        return;
    }
    
    selectedFiles.forEach(fileData => {
        const file = fileData.file;
        const fileId = fileData.id;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item uploaded';
        fileItem.setAttribute('data-file-id', fileId);
        
        const iconColor = getFileColor(file.name);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="bi ${getFileIcon(file.name)}" style="color: ${iconColor};"></i>
                <div style="flex: 1; min-width: 0;">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <div class="file-status">
                <span class="upload-success"><i class="bi bi-check-circle"></i> Listo para subir</span>
            </div>
            <button type="button" class="remove-file-btn" title="Eliminar archivo" onclick="eliminarArchivoDeLista('${fileId}')">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        filePreview.appendChild(fileItem);
    });
    
    actualizarContadorArchivos();
}

// Abrir selector de archivos al hacer clic en la zona de arrastre
dropZone.addEventListener('click', () => fileInput.click());

// Manejar archivos seleccionados a través del input de archivos
fileInput.addEventListener('change', e => {
    if (e.target.files.length > 0) {
        addFiles(e.target.files);
        // Limpiar el input para evitar problemas con archivos duplicados
        e.target.value = '';
    }
});

/* ================= ARRASTRE Y SOLTAR ================= */
// Manejar eventos de arrastrar y soltar
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        addFiles(files);
    }
});

/* ================= ENVÍO DEL FORMULARIO ================= */
// Manejar el envío del formulario con AJAX
trabajoForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Limpiar errores anteriores
    document.querySelectorAll('.error-text').forEach(e => e.remove());
    document.querySelectorAll('.is-invalid').forEach(e => e.classList.remove('is-invalid'));

    // Cambiar estado del botón a "cargando"
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    submitBtn.disabled = true;

    // Crear FormData para enviar archivos y datos del formulario
    const formData = new FormData(trabajoForm);
    selectedFiles.forEach(f => formData.append('archivos', f.file));

    try {
        // Enviar datos al servidor con fetch
        const response = await fetch(DJANGO_DATA.gestionarTrabajosUrl, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest', // Para identificar petición AJAX
                'X-CSRFToken': DJANGO_DATA.csrfToken
            },
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            // Mostrar errores de validación en los campos correspondientes
            for (const field in data.errors) {
                const input = document.getElementById(`id_${field}`);
                if (!input) continue;

                input.classList.add('is-invalid');
                const div = document.createElement('div');
                div.className = 'error-text';
                div.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${data.errors[field][0]}`;
                input.parentNode.appendChild(div);
            }

            // Restaurar botón a su estado original
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return; // ⛔ NO cerrar el formulario si hay errores
        }

        // CORREGIDO: Primero cerrar el formulario flotante
        floatingFormOverlay.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Restaurar el botón de enviar
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar trabajo';
        submitBtn.disabled = false;
        
        // Limpiar el formulario
        selectedFiles = [];
        updateFileInput();
        updateFilePreview();
        trabajoForm.reset();
        
        // Ahora mostrar el modal de éxito
        mostrarModalExito(data.message || 'Trabajo guardado correctamente');

    } catch (err) {
        console.error(err);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        alert('Error de conexión');
    }
});

/* ================= MODAL DE ÉXITO ================= */
// Función para mostrar el modal de éxito con un mensaje personalizado
function mostrarModalExito(msg) {
    // Establecer el mensaje en el modal
    document.getElementById('mensajeExito').textContent = msg;
    
    // Obtener el elemento del modal
    const modalElement = document.getElementById('modalExito');
    
    // Crear una instancia del modal de Bootstrap
    const modal = new bootstrap.Modal(modalElement);
    
    // Agregar evento para recargar la página cuando se cierre el modal
    // Usamos { once: true } para que el evento solo se ejecute una vez
    modalElement.addEventListener('hidden.bs.modal', function () {
        // Recargar la página para mostrar el nuevo trabajo
        location.reload();
    }, { once: true });
    
    // Mostrar el modal
    modal.show();
}

// Función para obtener icono según extensión del archivo
function getFileIcon(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    const iconMap = {
        'pdf': 'bi-file-earmark-pdf',
        'doc': 'bi-file-earmark-word',
        'docx': 'bi-file-earmark-word',
        'xls': 'bi-file-earmark-excel',
        'xlsx': 'bi-file-earmark-excel',
        'ppt': 'bi-file-earmark-ppt',
        'pptx': 'bi-file-earmark-ppt',
        'jpg': 'bi-file-earmark-image',
        'jpeg': 'bi-file-earmark-image',
        'png': 'bi-file-earmark-image',
        'gif': 'bi-file-earmark-image',
        'zip': 'bi-file-earmark-zip',
        'rar': 'bi-file-earmark-zip',
        'txt': 'bi-file-earmark-text',
        'mp4': 'bi-file-earmark-play',
        'mp3': 'bi-file-earmark-music'
    };
    
    return iconMap[ext] || 'bi-file-earmark';
}

// Función para obtener color según extensión del archivo
function getFileColor(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    const colorMap = {
        'pdf': '#FF6B6B',
        'doc': '#2E86C1',
        'docx': '#2E86C1',
        'xls': '#27AE60',
        'xlsx': '#27AE60',
        'ppt': '#E74C3C',
        'pptx': '#E74C3C',
        'jpg': '#F39C12',
        'jpeg': '#F39C12',
        'png': '#F39C12',
        'gif': '#F39C12',
        'zip': '#8E44AD',
        'rar': '#8E44AD'
    };
    
    return colorMap[ext] || '#6c757d';
}

// Función para formatear tamaño de archivo en unidades legibles
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para mostrar error general en el formulario
function mostrarErrorGeneral(mensaje) {
    // Limpiar errores anteriores
    document.querySelectorAll('.error-text').forEach(el => el.remove());
    
    // Crear alerta de error
    const floatingBody = document.querySelector('.floating-body');
    const existingAlert = floatingBody.querySelector('.alert.alert-danger');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger mt-3';
    errorAlert.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
                <strong>Error:</strong> ${mensaje}
                <div class="small mt-1">
                    <i class="bi bi-info-circle me-1"></i>
                    Verifica los datos e intenta de nuevo.
                </div>
            </div>
        </div>
    `;
    
    // Insertar antes del formulario
    floatingBody.insertBefore(errorAlert, trabajoForm);
    
    // Scroll al error
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Asegurar que la función eliminarArchivoDeLista esté disponible globalmente
window.eliminarArchivoDeLista = eliminarArchivoDeLista;
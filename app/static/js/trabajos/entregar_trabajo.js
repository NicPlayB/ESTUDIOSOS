// ===== MANEJO DEL SIDEBAR =====
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

// Event listeners
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleNav);
}

if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
}

// Cerrar nav cuando se hace click en un link
const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', closeNav);
});

// Cerrar nav cuando se redimensiona la ventana y vuelve al tamaño desktop
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeNav();
    }
});

// ===== FUNCIONALIDAD PARA LAS NUEVAS ALERTAS CLEAN (BORDE) =====
// Función para eliminar alertas
function removeAlertToast(toastElement) {
    if (!toastElement || !toastElement.parentElement) return;
    
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
});

// ===== FUNCIONALIDADES DEL CÓDIGO 1 APLICADAS =====
// Funcionalidad de previsualización de archivos
const modal = document.getElementById('modalPreview');
const previewContent = document.getElementById('previewContent');
const closeModal = document.getElementById('closeModal');

if (closeModal) {
    closeModal.onclick = () => {
        if (modal) {
            modal.style.display = 'none';
            previewContent.innerHTML = '';
        }
    };
}

if (modal) {
    // Cerrar modal al hacer clic fuera del contenido
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            previewContent.innerHTML = '';
        }
    };
}

// Manejo de tecla Escape para cerrar modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
        modal.style.display = 'none';
        previewContent.innerHTML = '';
    }
});

// Función para previsualizar imágenes en el modal
function openImagePreview(url) {
    if (!previewContent) return;
    
    previewContent.innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '80vh';
    img.style.borderRadius = '4px';
    previewContent.appendChild(img);
    
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Función para abrir cualquier archivo (detecta tipo)
function openFilePreview(url, fileName) {
    const lowerName = fileName.toLowerCase();
    
    // Verificar si es imagen
    if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || 
        lowerName.endsWith('.png') || lowerName.endsWith('.gif')) {
        openImagePreview(url);
    } else {
        // Para otros formatos, abrir en Google Docs Viewer
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + url)}&embedded=true`;
        window.open(viewerUrl, '_blank');
    }
}

// Función para mostrar el modal de éxito
function mostrarModalExito(mensaje) {
    if (mensaje) {
        const mensajeExito = document.getElementById('mensajeExito');
        if (mensajeExito) {
            mensajeExito.textContent = mensaje;
        }
    }
    
    setTimeout(function() {
        // Remover cualquier backdrop de modal que quede
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(function(backdrop) {
            backdrop.remove();
        });
        
        // Remover cualquier clase de modal abierto
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Mostrar el modal de éxito
        const modalExito = document.getElementById('modalExito');
        if (modalExito) {
            const modal = new bootstrap.Modal(modalExito);
            modal.show();
        }
    }, 100);
}

// ===== FUNCIONALIDAD DEL FORMULARIO FLOTANTE CENTRADO =====
const openFloatingBtn = document.getElementById('openFloatingForm');
const closeFloatingBtn = document.getElementById('closeFloatingForm');
const cancelBtn = document.getElementById('cancelBtn');
const floatingFormOverlay = document.getElementById('floatingFormOverlay');
const floatingForm = document.getElementById('floatingForm');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const editForm = document.getElementById('editForm');
const fileCountBadge = document.getElementById('fileCountBadge');

// Variables para manejar múltiples archivos
let selectedFiles = [];
let fileIdCounter = 0;
let entregaConfirmada = false;

// Variables para eliminar archivo
let urlEliminarArchivo = '';
let nombreArchivoEliminar = '';

// Función para abrir formulario flotante
function openFloatingForm() {
    if (!floatingFormOverlay) return;
    
    entregaConfirmada = false;
    floatingFormOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar formulario flotante
function hideFloatingForm() {
    if (!floatingFormOverlay) return;
    
    floatingFormOverlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Función para limpiar archivos seleccionados
function limpiarArchivosSeleccionados() {
    selectedFiles = [];
    fileIdCounter = 0;
    updateFileInput();
    updateFilePreview();
}

// Mostrar formulario flotante centrado
if (openFloatingBtn) {
    openFloatingBtn.addEventListener('click', () => {
        limpiarArchivosSeleccionados();
        openFloatingForm();
    });
}

// Ocultar formulario flotante
if (closeFloatingBtn) {
    closeFloatingBtn.addEventListener('click', () => {
        limpiarArchivosSeleccionados();
        hideFloatingForm();
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        limpiarArchivosSeleccionados();
        hideFloatingForm();
    });
}

// Cerrar formulario al hacer clic en el overlay
if (floatingFormOverlay) {
    floatingFormOverlay.addEventListener('click', (e) => {
        if (e.target === floatingFormOverlay) {
            limpiarArchivosSeleccionados();
            hideFloatingForm();
        }
    });
}

// Cerrar formulario con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && floatingFormOverlay && floatingFormOverlay.classList.contains('show')) {
        limpiarArchivosSeleccionados();
        hideFloatingForm();
    }
});

// Prevenir que el clic dentro del formulario cierre el overlay
if (floatingForm) {
    floatingForm.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Actualizar contador de archivos
function actualizarContadorArchivos() {
    if (!fileCountBadge) return;
    
    const totalArchivos = selectedFiles.length;
    if (totalArchivos > 0) {
        fileCountBadge.textContent = totalArchivos;
        fileCountBadge.style.display = 'flex';
    } else {
        fileCountBadge.style.display = 'none';
    }
}

// Función para obtener icono según extensión
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

// Función para obtener color según extensión
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

// Función para formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para eliminar archivo de la lista
function eliminarArchivoDeLista(fileId) {
    selectedFiles = selectedFiles.filter(file => file.id !== fileId);
    updateFileInput();
    updateFilePreview();
}

// Actualizar el input de archivos con DataTransfer
function updateFileInput() {
    if (!fileInput) return;
    
    const dt = new DataTransfer();
    selectedFiles.forEach(fileData => {
        dt.items.add(fileData.file);
    });
    
    // IMPORTANTE: Asignar los archivos al input
    fileInput.files = dt.files;
    actualizarContadorArchivos();
}

// Función para actualizar la vista previa de archivos
function updateFilePreview() {
    if (!filePreview) return;
    
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

// Manejar clic en la zona de arrastre
if (dropZone) {
    dropZone.addEventListener('click', () => {
        if (fileInput) {
            fileInput.click();
        }
    });
}

// Manejar cambio en el input de archivos
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        files.forEach(file => {
            // Verificar si el archivo ya existe (por nombre y tamaño)
            const fileExists = selectedFiles.some(f => 
                f.file.name === file.name && 
                f.file.size === file.size
            );
            
            if (!fileExists) {
                fileIdCounter++;
                selectedFiles.push({
                    id: `file_${fileIdCounter}`,
                    file: file
                });
            }
        });
        
        updateFileInput();
        updateFilePreview();
        
        // Mostrar mensaje de éxito
        if (dropZone) {
            const dropText = dropZone.querySelector('.drop-text');
            if (dropText) {
                const originalText = dropText.textContent;
                dropText.innerHTML = `<span style="color: var(--primary-orange);">${files.length} archivo(s) seleccionado(s)</span>`;
                
                // Restaurar texto después de 3 segundos
                setTimeout(() => {
                    dropText.textContent = originalText;
                }, 3000);
            }
        }
    });
}

// Arrastrar y soltar
if (dropZone) {
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
        
        const files = Array.from(e.dataTransfer.files);
        
        if (files.length === 0) return;
        
        files.forEach(file => {
            // Verificar si el archivo ya existe
            const fileExists = selectedFiles.some(f => 
                f.file.name === file.name && 
                f.file.size === file.size
            );
            
            if (!fileExists) {
                fileIdCounter++;
                selectedFiles.push({
                    id: `file_${fileIdCounter}`,
                    file: file
                });
            }
        });
        
        updateFileInput();
        updateFilePreview();
        
        // Mostrar mensaje de éxito
        const dropText = dropZone.querySelector('.drop-text');
        if (dropText) {
            const originalText = dropText.textContent;
            dropText.innerHTML = `<span style="color: var(--primary-orange);">${files.length} archivo(s) agregado(s)</span>`;
            
            // Restaurar texto después de 3 segundos
            setTimeout(() => {
                dropText.textContent = originalText;
            }, 3000);
        }
    });
}

// Manejar el envío del formulario
if (editForm) {
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Primero, verificar si hay archivos seleccionados
        if (selectedFiles.length === 0) {
            // Cerrar el formulario flotante automáticamente
            hideFloatingForm();
            
            // Mostrar modal de error
            setTimeout(() => {
                const modalError = document.getElementById('modalError');
                if (modalError) {
                    const modal = new bootstrap.Modal(modalError);
                    modal.show();
                }
            }, 300);
            
            return;
        }
        
        // Si hay archivos, proceder con la confirmación
        // Cerrar el formulario flotante automáticamente
        hideFloatingForm();
        
        // Mostrar modal de confirmación
        setTimeout(() => {
            const modalConfirmacion = document.getElementById('modalConfirmacion');
            if (modalConfirmacion) {
                const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
                if (mensajeConfirmacion) {
                    mensajeConfirmacion.textContent = `¿Estás seguro de entregar ${selectedFiles.length} archivo(s)?`;
                }
                
                const btnConfirmar = document.getElementById('btnConfirmar');
                if (btnConfirmar) {
                    btnConfirmar.style.display = 'block';
                    
                    // Configurar acción de confirmación
                    const confirmHandler = () => {
                        entregaConfirmada = true;
                        // Cerrar modal
                        const modal = bootstrap.Modal.getInstance(modalConfirmacion);
                        if (modal) {
                            modal.hide();
                        }
                        // Enviar formulario después de un breve retraso
                        setTimeout(() => {
                            updateFileInput();
                            editForm.submit();
                        }, 300);
                    };
                    
                    // Asignar evento al botón de confirmar
                    btnConfirmar.addEventListener('click', confirmHandler);
                    
                    // Mostrar modal
                    const modal = new bootstrap.Modal(modalConfirmacion);
                    modal.show();
                }
            }
        }, 300);
    });
}

// ===== ELIMINAR ARCHIVO DE ENTREGA - CON NUEVO MODAL =====
document.querySelectorAll(".delete-file-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        urlEliminarArchivo = this.dataset.url;
        nombreArchivoEliminar = this.dataset.fileName;
        
        // Mostrar modal de eliminación
        const mensajeEliminar = document.getElementById('mensajeEliminarArchivo');
        if (mensajeEliminar) {
            mensajeEliminar.textContent = `¿Estás seguro de eliminar el archivo "${nombreArchivoEliminar}"?`;
        }
        
        const modalEliminar = document.getElementById('modalEliminarArchivo');
        if (modalEliminar) {
            const modal = new bootstrap.Modal(modalEliminar);
            modal.show();
        }
    });
});

// Configurar botón de confirmar eliminación
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener('click', function() {
        if (urlEliminarArchivo) {
            window.location.href = urlEliminarArchivo;
        }
    });
}

// ===== FUNCIONES GLOBALES PARA USAR DESDE EL HTML =====
// Hacer las funciones accesibles globalmente
window.openFilePreview = openFilePreview;
window.eliminarArchivoDeLista = eliminarArchivoDeLista;
window.mostrarModalExito = mostrarModalExito;
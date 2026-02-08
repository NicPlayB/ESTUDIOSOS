// ===== MANEJO DEL SIDEBAR RESPONSIVE =====
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

// ===== NUEVO JAVASCRIPT PARA ALERTAS CLEAN (BORDE) =====
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
    // Esta parte se maneja en el HTML con window.DJANGO_DATA
});

// ===== MANEJO DEL FORMULARIO FLOTANTE CON AJAX =====
// Esta parte se ejecuta solo si puede_editar es true (se verifica en el HTML)

// ===== FUNCIONALIDADES GENERALES =====
// Funcionalidad de previsualización de archivos
const modal = document.getElementById('modalPreview');
const previewContent = document.getElementById('previewContent');
const closeModal = document.getElementById('closeModal');

if (closeModal) {
    closeModal.onclick = () => {
        modal.style.display = 'none';
        previewContent.innerHTML = '';
    };
}

// Cerrar modal al hacer clic fuera del contenido
if (modal) {
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            previewContent.innerHTML = '';
        }
    };
}

// Función para previsualizar imágenes en el modal
function openImagePreview(url) {
    previewContent.innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '80vh';
    img.style.borderRadius = '4px';
    previewContent.appendChild(img);
    modal.style.display = 'flex';
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

// Manejo de tecla Escape para cerrar modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
        previewContent.innerHTML = '';
    }
});

// Variables para manejar la eliminación de archivos
let deleteFileUrl = '';

// Manejar eliminación de archivos individuales - NUEVO MÉTODO CON MODAL PERSONALIZADO
document.querySelectorAll('.delete-file-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        deleteFileUrl = this.getAttribute('data-url');
        const fileName = this.getAttribute('data-file-name');
        
        // Actualizar el mensaje en el modal
        document.getElementById('deleteFileMessage').textContent = 
            `¿Estás seguro de eliminar el archivo "${fileName}"?`;
        
        // Mostrar modal de Bootstrap personalizado
        const deleteFileModal = new bootstrap.Modal(document.getElementById('deleteFileModal'));
        deleteFileModal.show();
    });
});

// Configurar el botón de confirmar eliminación de archivo
const confirmDeleteFileBtn = document.getElementById('confirmDeleteFile');
if (confirmDeleteFileBtn) {
    confirmDeleteFileBtn.addEventListener('click', function() {
        if (deleteFileUrl) {
            window.location.href = deleteFileUrl;
        }
    });
}

// Función para mostrar el modal de éxito (MEJORADA)
function mostrarModalExito(mensaje, callback) {
    if (mensaje) {
        document.getElementById('mensajeExito').textContent = mensaje;
    }
    
    // Limpiar cualquier modal backdrop existente
    const existingBackdrops = document.querySelectorAll('.modal-backdrop');
    existingBackdrops.forEach(backdrop => backdrop.remove());
    
    // Limpiar clases de modal abierto
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Obtener el modal
    const modalExito = document.getElementById('modalExito');
    if (modalExito) {
        // Crear una nueva instancia del modal
        const modal = new bootstrap.Modal(modalExito);
        
        // Configurar el evento de cierre
        const acceptBtn = document.getElementById('acceptSuccessBtn');
        if (acceptBtn) {
            // Remover event listeners anteriores
            const newAcceptBtn = acceptBtn.cloneNode(true);
            acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
            
            // Configurar nuevo event listener
            document.getElementById('acceptSuccessBtn').addEventListener('click', function() {
                modal.hide();
                if (callback && typeof callback === 'function') {
                    callback();
                }
            });
        }
        
        // Mostrar el modal
        modal.show();
    }
}

// ===== CÓDIGO ESPECÍFICO PARA EDICIÓN (solo ejecuta si puede_editar) =====
// Esta función se llama desde el HTML cuando puede_editar es true
function initEdicionTrabajo() {
    const openFloatingBtn = document.getElementById('openFloatingForm');
    const closeFloatingBtn = document.getElementById('closeFloatingForm');
    const floatingFormOverlay = document.getElementById('floatingFormOverlay');
    const floatingForm = document.getElementById('floatingForm');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const deleteWorkBtn = document.getElementById('deleteWorkBtn');
    const editForm = document.getElementById('editForm');
    const submitEditBtn = document.getElementById('submitEditForm');
    const fileCountBadge = document.getElementById('fileCountBadge');
    
    // Variables para manejar múltiples archivos
    let selectedFiles = [];
    let fileIdCounter = 0;

    // Mostrar formulario flotante centrado
    if (openFloatingBtn) {
        openFloatingBtn.addEventListener('click', () => {
            floatingFormOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }

    // Ocultar formulario flotante
    if (closeFloatingBtn) {
        closeFloatingBtn.addEventListener('click', () => {
            floatingFormOverlay.classList.remove('show');
            document.body.style.overflow = 'auto';
            resetErrors();
        });
    }

    // Cerrar formulario al hacer clic en el overlay
    if (floatingFormOverlay) {
        floatingFormOverlay.addEventListener('click', (e) => {
            if (e.target === floatingFormOverlay) {
                floatingFormOverlay.classList.remove('show');
                document.body.style.overflow = 'auto';
                resetErrors();
            }
        });
    }

    // Función para resetear errores
    function resetErrors() {
        const errorElements = document.querySelectorAll('.error-text');
        errorElements.forEach(el => {
            el.style.display = 'none';
        });
        
        const invalidInputs = document.querySelectorAll('.is-invalid');
        invalidInputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
    }

    // Cerrar formulario con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && floatingFormOverlay.classList.contains('show')) {
            floatingFormOverlay.classList.remove('show');
            document.body.style.overflow = 'auto';
            resetErrors();
        }
    });

    // Actualizar contador de archivos
    function actualizarContadorArchivos() {
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
        const dt = new DataTransfer();
        selectedFiles.forEach(fileData => {
            dt.items.add(fileData.file);
        });
        
        fileInput.files = dt.files;
        actualizarContadorArchivos();
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

    // Manejar clic en la zona de arrastre
    if (dropZone) {
        dropZone.addEventListener('click', () => {
            fileInput.click();
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
            const dropText = dropZone.querySelector('.drop-text');
            const originalText = dropText.textContent;
            dropText.innerHTML = `<span style="color: var(--primary-orange);">${files.length} archivo(s) seleccionado(s)</span>`;
            
            // Restaurar texto después de 3 segundos
            setTimeout(() => {
                dropText.textContent = originalText;
            }, 3000);
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
            const originalText = dropText.textContent;
            dropText.innerHTML = `<span style="color: var(--primary-orange);">${files.length} archivo(s) agregado(s)</span>`;
            
            // Restaurar texto después de 3 segundos
            setTimeout(() => {
                dropText.textContent = originalText;
            }, 3000);
        });
    }

    // Función para mostrar errores del formulario
    function mostrarErrores(errors) {
        resetErrors();
        
        for (const [field, messages] of Object.entries(errors)) {
            const input = document.getElementById(`id_${field}`);
            const errorDiv = document.getElementById(`${field}-error`);
            const errorText = document.getElementById(`${field}-error-text`);
            
            if (input && errorDiv && errorText) {
                input.classList.add('is-invalid');
                errorText.textContent = messages[0];
                errorDiv.style.display = 'flex';
            }
        }
    }

    // Enviar formulario con AJAX - CORREGIDO
    if (submitEditBtn) {
        submitEditBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Asegurarse de que todos los archivos estén en el input
            updateFileInput();
            
            const formData = new FormData(editForm);
            formData.append('editar', '1');
            
            // Mostrar loading
            const originalText = submitEditBtn.innerHTML;
            const originalDisabled = submitEditBtn.disabled;
            submitEditBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Guardando...';
            submitEditBtn.disabled = true;
            
            try {
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Restaurar el botón
                    submitEditBtn.innerHTML = originalText;
                    submitEditBtn.disabled = originalDisabled;
                    
                    // Cerrar el formulario flotante
                    floatingFormOverlay.classList.remove('show');
                    document.body.style.overflow = 'auto';
                    
                    // Mostrar modal de éxito después de un breve delay
                    setTimeout(() => {
                        mostrarModalExito(result.message || 'Trabajo actualizado con éxito', function() {
                            location.reload();
                        });
                    }, 300);
                } else {
                    // Mostrar errores
                    mostrarErrores(result.errors);
                    submitEditBtn.innerHTML = originalText;
                    submitEditBtn.disabled = originalDisabled;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
                submitEditBtn.innerHTML = originalText;
                submitEditBtn.disabled = originalDisabled;
            }
        });
    }

    // CORREGIDO: Manejar eliminación de trabajo - Cerrar formulario y mostrar modal
    if (deleteWorkBtn) {
        deleteWorkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Cerrar el formulario flotante
            floatingFormOverlay.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Mostrar el modal de confirmación después de un breve retraso
            setTimeout(() => {
                const deleteModal = new bootstrap.Modal(document.getElementById('deleteWorkModal'));
                deleteModal.show();
            }, 300);
        });
    }

    // Confirmar eliminación de trabajo - CORREGIDO
    const confirmDeleteWorkBtn = document.getElementById('confirmDeleteWork');
    if (confirmDeleteWorkBtn) {
        confirmDeleteWorkBtn.addEventListener('click', async function() {
            try {
                // Crear FormData para enviar la solicitud
                const formData = new FormData();
                formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
                formData.append('eliminar', '1');
                
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Cerrar modales
                    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteWorkModal'));
                    if (deleteModal) deleteModal.hide();
                    
                    if (floatingFormOverlay) {
                        floatingFormOverlay.classList.remove('show');
                    }
                    
                    // Mostrar mensaje de éxito y configurar redirección
                    mostrarModalExito('Trabajo eliminado correctamente', function() {
                        window.location.href = result.redirect_url || window.DJANGO_DATA.redirectUrl;
                    });
                } else {
                    alert('Error al eliminar el trabajo: ' + (result.message || 'Error desconocido'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar el trabajo. Por favor, inténtalo de nuevo.');
            }
        });
    }

    // Prevenir que el clic dentro del formulario cierre el overlay
    if (floatingForm) {
        floatingForm.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Exponer función para eliminar archivos
    window.eliminarArchivoDeLista = eliminarArchivoDeLista;
}

// ===== INICIALIZACIÓN AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades generales
    // (ya están definidas arriba y se ejecutan automáticamente)
    
    // Verificar si hay mensajes de éxito en window.DJANGO_DATA
    if (window.DJANGO_DATA && window.DJANGO_DATA.messages && window.DJANGO_DATA.messages.length > 0) {
        // Mostrar el modal de éxito con el primer mensaje de éxito
        setTimeout(function() {
            mostrarModalExito(window.DJANGO_DATA.messages[0].message);
        }, 100);
    }
});
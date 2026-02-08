// documentos.js

// ===== FUNCIONALIDADES GLOBALES =====
let deleteDocumentUrl = '';
let deleteDocumentTitle = '';

// Función para formatear el tamaño del archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para mostrar el modal de éxito
function mostrarModalExito(mensaje, callback) {
    const mensajeExito = document.getElementById('mensajeExito');
    if (mensajeExito && mensaje) {
        mensajeExito.textContent = mensaje;
    }

    const modalExito = document.getElementById('modalExito');
    if (modalExito) {
        const modal = new bootstrap.Modal(modalExito);
        
        // Configurar el evento de cierre
        const acceptBtn = document.getElementById('acceptSuccessBtn');
        if (acceptBtn) {
            // Clonar el botón para eliminar event listeners anteriores
            const newAcceptBtn = acceptBtn.cloneNode(true);
            acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
            
            // Configurar nuevo event listener
            document.getElementById('acceptSuccessBtn').addEventListener('click', function() {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }, { once: true });
        }
        
        modal.show();
    }
}

// Función para previsualizar imágenes en el modal
function openImagePreview(url) {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;
    
    previewContent.innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '80vh';
    img.style.borderRadius = '4px';
    previewContent.appendChild(img);
    
    const modal = document.getElementById('modalPreview');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Función para abrir cualquier archivo
function openFilePreview(url, fileName) {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;
    
    const lowerName = fileName.toLowerCase();
    
    // Verificar si es imagen
    if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || 
        lowerName.endsWith('.png') || lowerName.endsWith('.gif')) {
        openImagePreview(url);
    } else {
        // Para otros formatos, abrir en Google Docs Viewer
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + url)}&embedded=true`;
        previewContent.innerHTML = `
            <iframe src="${viewerUrl}" 
                    width="100%" 
                    height="600px" 
                    frameborder="0"
                    style="border-radius: 8px;">
            </iframe>
            <p class="mt-3 text-muted">Vista previa mediante Google Docs Viewer</p>
            <a href="${url}" target="_blank" class="btn btn-primary mt-2">
                <i class="bi bi-download me-1"></i> Descargar archivo original
            </a>
        `;
        
        const modal = document.getElementById('modalPreview');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
}

// Función para manejar la selección de archivos
function handleFileSelection(file, dropZone, filePreview) {
    // Validar tipo de archivo
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        mostrarModalExito('Tipo de archivo no permitido. Por favor, sube un archivo PDF, Word, Excel, PowerPoint o imagen.');
        return;
    }
    
    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        mostrarModalExito('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        return;
    }
    
    // Mostrar vista previa del archivo
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileType = file.type;
        let iconClass = 'bi-file-earmark';
        let iconColor = '#6c757d';
        
        if (fileType.startsWith('image/')) {
            iconClass = 'bi-file-earmark-image';
            iconColor = '#F39C12';
        } else if (fileType === 'application/pdf') {
            iconClass = 'bi-file-earmark-pdf';
            iconColor = '#FF6B6B';
        } else if (fileType.includes('word')) {
            iconClass = 'bi-file-earmark-word';
            iconColor = '#2B579A';
        } else if (fileType.includes('excel')) {
            iconClass = 'bi-file-earmark-excel';
            iconColor = '#217346';
        } else if (fileType.includes('powerpoint')) {
            iconClass = 'bi-file-earmark-ppt';
            iconColor = '#D24726';
        }
        
        const previewHTML = `
            <div class="file-preview-item uploaded">
                <div class="file-info">
                    <i class="bi ${iconClass}" style="color: ${iconColor}; font-size: 1.4rem;"></i>
                    <div style="flex: 1; min-width: 0;">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-status">
                    <span class="upload-success"><i class="bi bi-check-circle"></i> Listo para subir</span>
                </div>
            </div>
        `;
        
        if (filePreview) {
            filePreview.innerHTML = previewHTML;
        }
        
        // Actualizar el texto de la zona de arrastre
        const dropText = dropZone.querySelector('.drop-text');
        const dropSubtext = dropZone.querySelector('.drop-subtext');
        if (dropText) {
            dropText.innerHTML = `<span style="color: var(--primary-orange); font-weight: 600;">Archivo seleccionado</span>`;
        }
        if (dropSubtext) {
            dropSubtext.innerHTML = `<span style="color: var(--primary-orange);">${file.name}</span>`;
        }
    };
    reader.readAsDataURL(file);
}

// Función para ocultar formulario flotante
function hideFloatingForm() {
    const floatingFormOverlay = document.getElementById('floatingFormOverlay');
    const documentForm = document.getElementById('documentForm');
    const dropZone = document.getElementById('dropZone');
    const filePreview = document.getElementById('filePreview');
    
    if (floatingFormOverlay) {
        floatingFormOverlay.classList.remove('show');
    }
    
    document.body.style.overflow = 'auto';
    
    // Limpiar formulario
    if (documentForm) {
        documentForm.reset();
    }
    
    if (filePreview) {
        filePreview.innerHTML = '<p class="text-muted small m-0">Selecciona un archivo para cargarlo</p>';
    }
    
    // Restaurar texto original en drop-zone
    if (dropZone) {
        const dropText = dropZone.querySelector('.drop-text');
        const dropSubtext = dropZone.querySelector('.drop-subtext');
        if (dropText) {
            dropText.innerHTML = 'Arrastra y suelta el archivo aquí';
        }
        if (dropSubtext) {
            dropSubtext.innerHTML = 'o haz clic para seleccionar';
        }
    }
}

// Función para mostrar errores del formulario
function mostrarErroresFormulario(errors) {
    // Limpiar errores anteriores
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.error-text').forEach(el => {
        if (el.id !== 'deleteFileMessage') {
            el.remove();
        }
    });
    
    for (const [field, messages] of Object.entries(errors)) {
        const input = document.getElementById(`id_${field}`);
        if (input) {
            input.classList.add('is-invalid');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-text';
            errorDiv.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${messages[0]}`;
            
            input.parentNode.appendChild(errorDiv);
        }
    }
}

// ===== INICIALIZACIÓN CUANDO CARGA LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    // ===== MANEJO DEL SIDEBAR RESPONSIVE =====
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const navOverlay = document.getElementById('navOverlay');

    if (hamburgerBtn && sidebarNav) {
        hamburgerBtn.addEventListener('click', () => {
            sidebarNav.classList.toggle('show');
            if (navOverlay) {
                navOverlay.classList.toggle('show');
            }
            hamburgerBtn.classList.toggle('hide');
        });
    }

    if (navOverlay && sidebarNav && hamburgerBtn) {
        navOverlay.addEventListener('click', () => {
            sidebarNav.classList.remove('show');
            navOverlay.classList.remove('show');
            hamburgerBtn.classList.remove('hide');
        });
    }

    // ===== MANEJO DEL FORMULARIO FLOTANTE =====
    const openFloatingBtn = document.getElementById('openFloatingForm');
    const closeFloatingBtn = document.getElementById('closeFloatingForm');
    const cancelFloatingBtn = document.getElementById('cancelFloatingForm');
    const floatingFormOverlay = document.getElementById('floatingFormOverlay');
    const floatingForm = document.getElementById('floatingForm');
    const documentForm = document.getElementById('documentForm');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('id_archivo');
    const filePreview = document.getElementById('filePreview');
    const submitDocumentBtn = document.getElementById('submitDocumentForm');

    // Mostrar formulario flotante
    if (openFloatingBtn) {
        openFloatingBtn.addEventListener('click', () => {
            if (floatingFormOverlay) {
                floatingFormOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Configurar botones para cerrar el formulario
    if (closeFloatingBtn) {
        closeFloatingBtn.addEventListener('click', hideFloatingForm);
    }

    if (cancelFloatingBtn) {
        cancelFloatingBtn.addEventListener('click', hideFloatingForm);
    }

    // Cerrar formulario al hacer clic en el overlay
    if (floatingFormOverlay) {
        floatingFormOverlay.addEventListener('click', (e) => {
            if (e.target === floatingFormOverlay) {
                hideFloatingForm();
            }
        });
    }

    // Cerrar formulario con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && floatingFormOverlay && floatingFormOverlay.classList.contains('show')) {
            hideFloatingForm();
        }
    });

    // Prevenir que el clic dentro del formulario cierre el overlay
    if (floatingForm) {
        floatingForm.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // ===== ZONA DE ARRASTRE Y SELECCIÓN DE ARCHIVOS =====
    if (dropZone) {
        dropZone.addEventListener('click', () => {
            if (fileInput) {
                fileInput.click();
            }
        });

        // Efectos de arrastrar
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
            if (files.length > 0 && fileInput) {
                // Solo tomamos el primer archivo
                const file = files[0];
                handleFileSelection(file, dropZone, filePreview);
                
                // Actualizar el input file con el archivo arrastrado
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            }
        });
    }

    if (fileInput && dropZone && filePreview) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileSelection(file, dropZone, filePreview);
            }
        });
    }

    // ===== MANEJO DEL FORMULARIO DE SUBIDA =====
    if (documentForm && submitDocumentBtn) {
        documentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar que se haya seleccionado un archivo
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                mostrarModalExito('Por favor, selecciona un archivo');
                return;
            }
            
            // Validar título
            const tituloInput = document.getElementById('id_titulo');
            if (!tituloInput || !tituloInput.value.trim()) {
                mostrarModalExito('Por favor, ingresa un título para el documento');
                if (tituloInput) tituloInput.focus();
                return;
            }
            
            const originalText = submitDocumentBtn.innerHTML;
            submitDocumentBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Subiendo...';
            submitDocumentBtn.disabled = true;
            
            try {
                const formData = new FormData(documentForm);
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
                if (csrfToken) {
                    formData.append('csrfmiddlewaretoken', csrfToken.value);
                }
                
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                // Intentar parsear la respuesta como JSON
                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    // Si no es JSON, asumimos que fue exitoso
                    result = { success: true, message: 'Documento subido correctamente' };
                }
                
                if (result.success) {
                    // Primero ocultar el formulario
                    hideFloatingForm();
                    
                    // Luego mostrar el modal de éxito
                    setTimeout(() => {
                        mostrarModalExito(result.message || 'Documento subido correctamente', function() {
                            // Recargar la página después de cerrar el modal
                            location.reload();
                        });
                    }, 300);
                } else {
                    // Mostrar errores del formulario
                    if (result.errors) {
                        mostrarErroresFormulario(result.errors);
                    } else {
                        mostrarModalExito(result.message || 'Error al subir el documento');
                    }
                    submitDocumentBtn.innerHTML = originalText;
                    submitDocumentBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                mostrarModalExito('Error al subir el documento. Por favor, inténtalo de nuevo.');
                submitDocumentBtn.innerHTML = originalText;
                submitDocumentBtn.disabled = false;
            }
        });
    }

    // ===== FUNCIONALIDADES DE VISUALIZACIÓN DE ARCHIVOS =====
    const modal = document.getElementById('modalPreview');
    const closeModal = document.getElementById('closeModal');

    if (closeModal) {
        closeModal.onclick = () => {
            if (modal) {
                modal.style.display = 'none';
            }
            const previewContent = document.getElementById('previewContent');
            if (previewContent) {
                previewContent.innerHTML = '';
            }
        };
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                const previewContent = document.getElementById('previewContent');
                if (previewContent) {
                    previewContent.innerHTML = '';
                }
            }
        };
    }

    // Manejo de tecla Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            const previewContent = document.getElementById('previewContent');
            if (previewContent) {
                previewContent.innerHTML = '';
            }
        }
    });

    // ===== MANEJO DE ELIMINACIÓN DE DOCUMENTOS =====
    const confirmDeleteFileBtn = document.getElementById('confirmDeleteFile');
    if (confirmDeleteFileBtn) {
        confirmDeleteFileBtn.addEventListener('click', async function() {
            if (!deleteDocumentUrl) return;
            
            const btn = this;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Eliminando...';
            btn.disabled = true;
            
            try {
                // Crear FormData para enviar la solicitud
                const formData = new FormData();
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
                if (csrfToken) {
                    formData.append('csrfmiddlewaretoken', csrfToken.value);
                }
                
                const response = await fetch(deleteDocumentUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                // Intentar parsear la respuesta como JSON
                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    // Si no es JSON, asumimos que fue exitoso
                    result = { success: true, message: 'Documento eliminado correctamente' };
                }
                
                // Cerrar el modal de confirmación
                const deleteFileModal = bootstrap.Modal.getInstance(document.getElementById('deleteFileModal'));
                if (deleteFileModal) deleteFileModal.hide();
                
                if (result.success) {
                    // Mostrar modal de éxito
                    mostrarModalExito(result.message || 'Documento eliminado correctamente', function() {
                        location.reload();
                    });
                } else {
                    mostrarModalExito('Error al eliminar el documento: ' + (result.message || 'Error desconocido'));
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
                
            } catch (error) {
                console.error('Error:', error);
                mostrarModalExito('Error de conexión. Por favor, inténtalo de nuevo.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // ===== AUTO-CIERRE DE MENSAJES =====
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert-auto-close');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
    
    // ===== VERIFICAR SI HAY MENSAJES DE ÉXITO DESDE DJANGO =====
    // Verificar mensajes de Django desde la variable global
    if (window.DJANGO_MESSAGES && window.DJANGO_MESSAGES.length > 0) {
        window.DJANGO_MESSAGES.forEach(messageData => {
            if (messageData.tags === 'success') {
                // Opcional: Mostrar modal de éxito para mensajes de éxito
                // mostrarModalExito(messageData.message);
            }
        });
    }
});

// Función global para abrir vista previa de archivos (usada en los botones de las cards)
window.openFilePreview = openFilePreview;
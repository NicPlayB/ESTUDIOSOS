// ===== FUNCIONALIDAD DEL NUEVO SISTEMA DE ALERTAS CLEAN (BORDE) =====
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

// ===== FUNCIONALIDADES DEL CÓDIGO 1 APLICADAS =====
// Función para previsualizar imágenes en el modal
function openImagePreview(url) {
    const modal = document.getElementById('modalPreview');
    const previewContent = document.getElementById('previewContent');
    
    if (!modal || !previewContent) return;
    
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

// Función para mostrar el modal de éxito
function mostrarModalExito(mensaje) {
    const modalExito = document.getElementById('modalExito');
    const mensajeExito = document.getElementById('mensajeExito');
    
    if (!modalExito || !mensajeExito) return;
    
    if (mensaje) {
        mensajeExito.textContent = mensaje;
    }
    
    // Usar Bootstrap Modal si está disponible
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalExito);
        modal.show();
    } else {
        // Fallback si Bootstrap no está disponible
        modalExito.style.display = 'block';
        modalExito.classList.add('show');
    }
}

// ===== MANEJO DEL SIDEBAR (DEL CÓDIGO 1) =====
function initSidebar() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const navOverlay = document.getElementById('navOverlay');

    if (!hamburgerBtn || !sidebarNav || !navOverlay) return;

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
    hamburgerBtn.addEventListener('click', toggleNav);
    navOverlay.addEventListener('click', closeNav);

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
}

// ===== INICIALIZACIÓN DEL MODAL DE PREVIEW =====
function initPreviewModal() {
    const modal = document.getElementById('modalPreview');
    const previewContent = document.getElementById('previewContent');
    const closeModal = document.getElementById('closeModal');

    if (!modal || !previewContent || !closeModal) return;

    closeModal.onclick = () => {
        modal.style.display = 'none';
        previewContent.innerHTML = '';
    };

    // Cerrar modal al hacer clic fuera del contenido
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            previewContent.innerHTML = '';
        }
    };

    // Manejo de tecla Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            previewContent.innerHTML = '';
        }
    });
}

// ===== INICIALIZACIÓN DE ALERTAS =====
function initAlerts() {
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
}

// ===== INICIALIZACIÓN DE MODALES DE BOOTSTRAP =====
function initBootstrapModals() {
    // Inicializar modales de Bootstrap si existen
    const modals = document.querySelectorAll('.modal');
    if (modals.length > 0 && typeof bootstrap !== 'undefined') {
        // Bootstrap ya se inicializa automáticamente
        // Solo añadimos funcionalidad adicional si es necesario
        
        const modalConfirmacion = document.getElementById('modalConfirmacion');
        const btnConfirmar = document.getElementById('btnConfirmar');
        
        if (modalConfirmacion && btnConfirmar) {
            // Limpiar event listeners previos
            const newBtnConfirmar = btnConfirmar.cloneNode(true);
            btnConfirmar.parentNode.replaceChild(newBtnConfirmar, btnConfirmar);
            
            // El event listener para confirmación se maneja en el HTML o en otro lugar específico
            // No lo inicializamos aquí porque depende del contexto
        }
    }
}

// ===== INICIALIZACIÓN DEL FORMULARIO FLOTANTE (si existe en esta página) =====
function initFloatingForm() {
    const openFloatingBtn = document.getElementById('openFloatingForm');
    const closeFloatingBtn = document.getElementById('closeFloatingForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const floatingFormOverlay = document.getElementById('floatingFormOverlay');
    const floatingForm = document.getElementById('floatingForm');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const editForm = document.getElementById('editForm');
    
    // Variables para manejar múltiples archivos
    let selectedFiles = [];
    let fileIdCounter = 0;

    // Verificar si los elementos existen (el formulario flotante puede no estar presente)
    if (!openFloatingBtn || !floatingFormOverlay) {
        return; // No hay formulario flotante en esta página
    }

    // Mostrar formulario flotante centrado
    openFloatingBtn.addEventListener('click', () => {
        floatingFormOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    // Ocultar formulario flotante
    function hideFloatingForm() {
        floatingFormOverlay.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    if (closeFloatingBtn) {
        closeFloatingBtn.addEventListener('click', hideFloatingForm);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideFloatingForm);
    }

    // Cerrar formulario al hacer clic en el overlay
    floatingFormOverlay.addEventListener('click', (e) => {
        if (e.target === floatingFormOverlay) {
            hideFloatingForm();
        }
    });

    // Cerrar formulario con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && floatingFormOverlay && floatingFormOverlay.classList.contains('show')) {
            hideFloatingForm();
        }
    });

    // Actualizar contador de archivos
    function actualizarContadorArchivos() {
        const fileCountBadge = document.getElementById('fileCountBadge');
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
        const dt = new DataTransfer();
        selectedFiles.forEach(fileData => {
            dt.items.add(fileData.file);
        });
        
        // Asignar los archivos al input
        if (fileInput) {
            fileInput.files = dt.files;
            actualizarContadorArchivos();
        }
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
    if (dropZone && fileInput) {
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
            if (dropZone) {
                const dropText = dropZone.querySelector('.drop-text');
                if (dropText) {
                    const originalText = dropText.textContent;
                    dropText.innerHTML = `<span style="color: var(--primary-orange);">${files.length} archivo(s) agregado(s)</span>`;
                    
                    // Restaurar texto después de 3 segundos
                    setTimeout(() => {
                        dropText.textContent = originalText;
                    }, 3000);
                }
            }
        });
    }

    // Prevenir que el clic dentro del formulario cierre el overlay
    if (floatingForm) {
        floatingForm.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Manejar el envío del formulario
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            // Asegurarse de que todos los archivos estén en el input antes de enviar
            updateFileInput();
            
            // Validar que haya al menos un archivo
            if (fileInput && fileInput.files.length === 0) {
                e.preventDefault();
                // Mostrar modal de confirmación estilo Código 1
                const modalConfirmacion = document.getElementById('modalConfirmacion');
                const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
                const btnConfirmar = document.getElementById('btnConfirmar');
                
                if (modalConfirmacion && mensajeConfirmacion && btnConfirmar) {
                    mensajeConfirmacion.textContent = 'Por favor, selecciona al menos un archivo para entregar.';
                    btnConfirmar.style.display = 'none';
                    
                    if (typeof bootstrap !== 'undefined') {
                        const modal = new bootstrap.Modal(modalConfirmacion);
                        modal.show();
                    }
                }
                return;
            }
            
            // Mostrar confirmación estilo Código 1
            e.preventDefault();
            const modalConfirmacion = document.getElementById('modalConfirmacion');
            const mensajeConfirmacion = document.getElementById('mensajeConfirmacion');
            const btnConfirmar = document.getElementById('btnConfirmar');
            
            if (!modalConfirmacion || !mensajeConfirmacion || !btnConfirmar) return;
            
            const fileCount = fileInput ? fileInput.files.length : 0;
            mensajeConfirmacion.textContent = `¿Estás seguro de entregar ${fileCount} archivo(s)?`;
            btnConfirmar.style.display = 'block';
            
            // Configurar acción de confirmación
            const confirmHandler = () => {
                // Remover el event listener para evitar múltiples envíos
                btnConfirmar.removeEventListener('click', confirmHandler);
                
                // Cerrar modal
                if (typeof bootstrap !== 'undefined') {
                    const modal = bootstrap.Modal.getInstance(modalConfirmacion);
                    if (modal) modal.hide();
                }
                
                // Enviar formulario
                setTimeout(() => {
                    editForm.submit();
                }, 300);
            };
            
            // Asignar evento al botón de confirmar
            btnConfirmar.addEventListener('click', confirmHandler);
            
            // Mostrar modal
            if (typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(modalConfirmacion);
                modal.show();
            }
        });
    }
    
    // Hacer la función accesible globalmente
    window.eliminarArchivoDeLista = eliminarArchivoDeLista;
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener("DOMContentLoaded", function() {
    // Inicializar componentes
    initAlerts();
    initSidebar();
    initPreviewModal();
    initBootstrapModals();
    initFloatingForm();
    
    // Hacer funciones globales accesibles
    window.removeAlertToast = removeAlertToast;
    window.openImagePreview = openImagePreview;
    window.openFilePreview = openFilePreview;
    window.mostrarModalExito = mostrarModalExito;
    
    console.log('Aplicación de entrega de trabajos inicializada correctamente');
});

// Manejo de errores global
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});
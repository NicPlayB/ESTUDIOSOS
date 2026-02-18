// static/js/administrador/certificaciones/certificados_usuario.js

// ===== VARIABLES GLOBALES =====
let deleteDocumentUrl = '';
let deleteDocumentTitle = '';
let currentFile = null; // Para manejar el archivo actual

// ===== MANEJO DEL SIDEBAR RESPONSIVE =====
document.addEventListener('DOMContentLoaded', function() {
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
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleNav);
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // ===== MANEJO DEL FORMULARIO FLOTANTE CON DOS COLUMNAS =====
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
    const errorArchivoAlert = document.getElementById('error_archivo_alert');
    const errorArchivoText = document.getElementById('error_archivo_text');

    // Función para limpiar errores del formulario
    function limpiarErroresFormulario() {
        document.querySelectorAll('.form-control').forEach(el => {
            el.classList.remove('is-invalid');
        });
        document.querySelectorAll('.form-select').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        document.querySelectorAll('.error-text').forEach(el => {
            el.textContent = '';
        });
        
        // Ocultar alerta de error de archivo
        if (errorArchivoAlert) {
            errorArchivoAlert.classList.add('d-none');
        }
        
        if (dropZone) {
            dropZone.style.borderColor = '#dee2e6';
        }
    }

    // Mostrar formulario flotante
    if (openFloatingBtn) {
        openFloatingBtn.addEventListener('click', () => {
            floatingFormOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            limpiarErroresFormulario();
            currentFile = null;
        });
    }

    // Función para ocultar formulario flotante
    function hideFloatingForm() {
        floatingFormOverlay.classList.remove('show');
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
            if (dropText) dropText.innerHTML = 'Arrastra y suelta el archivo aquí';
            if (dropSubtext) dropSubtext.innerHTML = 'o haz clic para seleccionar';
        }
        
        // Limpiar errores del formulario
        limpiarErroresFormulario();
        
        // Restablecer el botón de submit
        if (submitDocumentBtn) {
            submitDocumentBtn.innerHTML = '<i class="bi bi-upload me-2"></i>Subir documento';
            submitDocumentBtn.disabled = false;
        }
        
        // Limpiar archivo actual
        currentFile = null;
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
        if (e.key === 'Escape' && floatingFormOverlay.classList.contains('show')) {
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
            fileInput.click();
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
            if (files.length > 0) {
                // Solo tomamos el primer archivo
                const file = files[0];
                handleFileSelection(file);
                
                // Actualizar el input file con el archivo arrastrado
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                currentFile = file;
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                currentFile = file;
                handleFileSelection(file);
            }
        });
    }

    // Función para manejar la selección de archivos
    function handleFileSelection(file) {
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
            mostrarErrorArchivo('Tipo de archivo no permitido. Por favor, sube un archivo PDF, Word, Excel, PowerPoint o imagen.');
            return;
        }
        
        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            mostrarErrorArchivo('El archivo es demasiado grande. El tamaño máximo es 10MB.');
            return;
        }
        
        // Limpiar errores anteriores
        limpiarErroresFormulario();
        
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
            
            // Truncar nombre del archivo si es muy largo
            let fileName = file.name;
            if (fileName.length > 40) {
                fileName = fileName.substring(0, 37) + '...';
            }
            
            const previewHTML = `
                <div class="file-preview-item uploaded">
                    <button type="button" class="file-remove-btn" title="Quitar archivo">
                        <i class="bi bi-x"></i>
                    </button>
                    <div class="file-info">
                        <i class="bi ${iconClass}" style="color: ${iconColor}; font-size: 1.4rem;"></i>
                        <div style="flex: 1; min-width: 0; overflow: hidden;">
                            <div class="file-name" title="${file.name}">${fileName}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <div class="file-status">
                        <span class="upload-success"><i class="bi bi-check-circle"></i> Listo</span>
                    </div>
                </div>
            `;
            
            if (filePreview) {
                filePreview.innerHTML = previewHTML;
            }
            
            // Actualizar el texto de la zona de arrastre con nombre truncado
            if (dropZone) {
                const dropText = dropZone.querySelector('.drop-text');
                const dropSubtext = dropZone.querySelector('.drop-subtext');
                
                // Truncar también en el texto de la zona de arrastre
                let displayName = file.name;
                if (displayName.length > 35) {
                    displayName = displayName.substring(0, 32) + '...';
                }
                
                if (dropText) {
                    dropText.innerHTML = `<span style="color: var(--primary-orange); font-weight: 600;">Archivo seleccionado</span>`;
                }
                
                if (dropSubtext) {
                    dropSubtext.innerHTML = `<span style="color: var(--primary-orange);" title="${file.name}">${displayName}</span>`;
                }
            }
            
            // Añadir event listener al botón de eliminar archivo
            setTimeout(() => {
                const removeBtn = document.querySelector('.file-remove-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        removeSelectedFile();
                    });
                }
            }, 100);
        };
        reader.readAsDataURL(file);
    }

    // Función para remover el archivo seleccionado
    function removeSelectedFile() {
        // Limpiar el input file
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Limpiar la vista previa
        if (filePreview) {
            filePreview.innerHTML = '<p class="text-muted small m-0">Selecciona un archivo para cargarlo</p>';
        }
        
        // Restaurar texto original en drop-zone
        if (dropZone) {
            const dropText = dropZone.querySelector('.drop-text');
            const dropSubtext = dropZone.querySelector('.drop-subtext');
            if (dropText) dropText.innerHTML = 'Arrastra y suelta el archivo aquí';
            if (dropSubtext) dropSubtext.innerHTML = 'o haz clic para seleccionar';
        }
        
        // Limpiar error de archivo si lo hay
        limpiarErroresFormulario();
        
        // Limpiar archivo actual
        currentFile = null;
    }

    // Función para mostrar error de archivo con diseño de alerta
    function mostrarErrorArchivo(mensaje) {
        if (errorArchivoAlert && errorArchivoText) {
            errorArchivoText.textContent = mensaje;
            errorArchivoAlert.classList.remove('d-none');
        }
        
        if (dropZone) {
            dropZone.style.borderColor = '#dc3545';
        }
        
        // Hacer scroll a la alerta
        setTimeout(() => {
            errorArchivoAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    // Función para formatear el tamaño del archivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ===== MANEJO DEL FORMULARIO DE SUBIDA CON AJAX =====
    if (documentForm) {
        documentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Limpiar errores anteriores
            limpiarErroresFormulario();
            
            // Validación básica en el frontend
            let hasError = false;
            const tipoInput = document.getElementById('id_tipo');
            const tituloInput = document.getElementById('id_titulo');
            
            if (tipoInput && !tipoInput.value) {
                const errorTipo = document.getElementById('error_tipo');
                if (errorTipo) {
                    errorTipo.textContent = 'Selecciona un tipo de documento';
                }
                tipoInput.classList.add('is-invalid');
                hasError = true;
            }
            
            if (tituloInput && !tituloInput.value.trim()) {
                const errorTitulo = document.getElementById('error_titulo');
                if (errorTitulo) {
                    errorTitulo.textContent = 'Ingresa un título para el documento';
                }
                tituloInput.classList.add('is-invalid');
                hasError = true;
            }
            
            // Verificar si hay archivo seleccionado
            if (!currentFile && (!fileInput.files || fileInput.files.length === 0)) {
                mostrarErrorArchivo('Debes seleccionar un archivo');
                hasError = true;
            }
            
            if (hasError) {
                // Hacer scroll al primer error
                const firstError = document.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            const originalText = submitDocumentBtn.innerHTML;
            submitDocumentBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Subiendo...';
            submitDocumentBtn.disabled = true;
            
            try {
                const formData = new FormData(documentForm);
                
                // Si hay un archivo actual pero no en el input, agregarlo manualmente
                if (currentFile && (!fileInput.files || fileInput.files.length === 0)) {
                    formData.append('archivo', currentFile);
                }
                
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const result = await response.json();
                
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
                        // Si no hay errores específicos, mostrar un mensaje general
                        mostrarAlertaError(result.message || 'Error al subir el documento');
                    }
                    submitDocumentBtn.innerHTML = originalText;
                    submitDocumentBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                mostrarAlertaError('Error al subir el documento. Por favor, inténtalo de nuevo.');
                submitDocumentBtn.innerHTML = originalText;
                submitDocumentBtn.disabled = false;
            }
        });
    }

    // Función para mostrar errores del formulario
    function mostrarErroresFormulario(errors) {
        // Mostrar errores para cada campo
        for (const [field, messages] of Object.entries(errors)) {
            const input = document.getElementById(`id_${field}`);
            const errorElement = document.getElementById(`error_${field}`);
            
            if (input && errorElement) {
                input.classList.add('is-invalid');
                errorElement.textContent = messages[0];
                
                // Si es el campo archivo, mostrar alerta especial
                if (field === 'archivo') {
                    mostrarErrorArchivo(messages[0]);
                }
                
                // Hacer scroll al primer campo con error
                if (Object.keys(errors)[0] === field) {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }

    // ===== FUNCIONALIDADES DE VISUALIZACIÓN DE ARCHIVOS =====
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

    // Hacer función openFilePreview disponible globalmente
    window.openFilePreview = function(url, fileName) {
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
            modal.style.display = 'flex';
        }
    };

    // Manejo de tecla Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            previewContent.innerHTML = '';
        }
    });

    // ===== MANEJO DE ELIMINACIÓN DE DOCUMENTOS =====
    // Manejar eliminación de documentos
    document.querySelectorAll('.delete-document-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const documentId = this.getAttribute('data-document-id');
            const documentTitle = this.getAttribute('data-document-title');
            
            deleteDocumentUrl = window.djangoConfig.eliminarDocumentoUrl.replace('0', documentId);
            deleteDocumentTitle = documentTitle;
            
            // Actualizar el mensaje en el modal
            document.getElementById('deleteFileMessage').textContent = 
                `¿Estás seguro de eliminar el documento "${documentTitle}"?`;
            
            // Mostrar modal de Bootstrap personalizado
            const deleteFileModal = new bootstrap.Modal(document.getElementById('deleteFileModal'));
            deleteFileModal.show();
        });
    });

    // Configurar el botón de confirmar eliminación
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
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                formData.append('csrfmiddlewaretoken', csrfToken);
                
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
                    mostrarAlertaError('Error al eliminar el documento: ' + (result.message || 'Error desconocido'));
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
                
            } catch (error) {
                console.error('Error:', error);
                mostrarAlertaError('Error de conexión. Por favor, inténtalo de nuevo.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // ===== FUNCIONES AUXILIARES =====
    
    // Función para mostrar alerta de error en la esquina superior derecha
    function mostrarAlertaError(mensaje) {
        const alertContainer = document.querySelector('.alert-container');
        if (!alertContainer) return;
        
        const alertId = 'alert-' + Date.now();
        
        const alertHTML = `
            <div id="${alertId}" class="alert alert-danger alert-dismissible fade show alert-auto-close" role="alert">
                <i class="bi bi-x-circle-fill alert-icon"></i>
                <span>${mensaje}</span>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('afterbegin', alertHTML);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    // Función para mostrar el modal de éxito
    function mostrarModalExito(mensaje, callback) {
        if (mensaje) {
            const mensajeExito = document.getElementById('mensajeExito');
            if (mensajeExito) {
                mensajeExito.textContent = mensaje;
            }
        }
        
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
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }, { once: true }); // Solo se ejecuta una vez
            }
            
            // Mostrar el modal
            modal.show();
        }
    }

    // Auto-cierre de mensajes después de 5 segundos
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert-auto-close');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
});
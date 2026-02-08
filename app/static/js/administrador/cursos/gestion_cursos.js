/* ===== MANEJO DEL SIDEBAR RESPONSIVE ===== */
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

/* ===== FUNCIÓN PARA ELIMINAR ALERTAS ===== */
function removeAlertToast(toastElement) {
    if (!toastElement.parentElement) return;
    
    toastElement.classList.add('hide');
    
    toastElement.addEventListener('animationend', () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    });
}

/* ===== AUTO-CERRAR ALERTAS ===== */
document.addEventListener('DOMContentLoaded', function() {
    const alertToasts = document.querySelectorAll('.alert-toast');
    alertToasts.forEach(toast => {
        setTimeout(() => {
            removeAlertToast(toast);
        }, 5000);
    });
    
    // Inicializar modales usando las variables de Django
    if (typeof djangoVariables !== 'undefined') {
        // Modal de crear
        if (djangoVariables.mostrar_modal_crear) {
            const modalCrear = document.getElementById('modalCrearCurso');
            if (modalCrear) {
                const bsModalCrear = new bootstrap.Modal(modalCrear);
                bsModalCrear.show();
                
                modalCrear.addEventListener('hidden.bs.modal', function () {
                    window.location.href = window.location.pathname;
                });
            }
        }
        
        // Modal de editar específico
        if (djangoVariables.mostrar_modal_editar) {
            const modalEditar = document.getElementById('modalEditarCurso' + djangoVariables.mostrar_modal_editar);
            if (modalEditar) {
                const bsModalEditar = new bootstrap.Modal(modalEditar);
                bsModalEditar.show();
                
                modalEditar.addEventListener('hidden.bs.modal', function () {
                    window.location.href = window.location.pathname;
                });
            }
        }
        
        // Modal de éxito
        if (djangoVariables.exito) {
            const modalExito = document.getElementById('modalExito');
            if (modalExito) {
                const bsModalExito = new bootstrap.Modal(modalExito);
                bsModalExito.show();
                
                modalExito.addEventListener('hidden.bs.modal', function () {
                    window.location.href = window.location.pathname;
                });
            }
        }
    }
});

/* ===== VER IMAGEN COMPLETA ===== */
function verImagenCompleta(imageUrl) {
    const fullImage = document.getElementById('fullImage');
    fullImage.src = imageUrl;
    
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
}

/* ===== ZONA DE ARRASTRE PARA CREAR CURSO ===== */
const dropZoneCrear = document.getElementById('dropZoneCrear');
const imagenInputCrear = document.getElementById('imagenInputCrear');
const filePreviewCrear = document.getElementById('filePreviewCrear');

if (dropZoneCrear) {
    dropZoneCrear.addEventListener('click', () => {
        imagenInputCrear.click();
    });

    dropZoneCrear.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneCrear.classList.add('dragover');
    });

    dropZoneCrear.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneCrear.classList.remove('dragover');
    });

    dropZoneCrear.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneCrear.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            handleFileSelectionCrear(file);
            
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imagenInputCrear.files = dataTransfer.files;
        }
    });
}

if (imagenInputCrear) {
    imagenInputCrear.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelectionCrear(file);
        }
    });
}

/* ===== FUNCIÓN PARA MANEJAR LA SELECCIÓN DE ARCHIVOS EN CREAR ===== */
function handleFileSelectionCrear(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
        mostrarAlertaError('Tipo de archivo no permitido. Por favor, sube una imagen JPG, JPEG o PNG.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        mostrarAlertaError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        let fileName = file.name;
        let displayName = file.name;
        
        if (fileName.length > 35) {
            displayName = fileName.substring(0, 32) + '...';
        }
        
        const previewHTML = `
            <div class="file-preview-item uploaded" id="filePreviewItemCrear">
                <div class="file-info">
                    <i class="bi bi-file-earmark-image" style="color: #F39C12; font-size: 1.4rem;"></i>
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        <div class="file-name" title="${fileName}">${displayName}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-status">
                    <span class="upload-success"><i class="bi bi-check-circle"></i> Lista</span>
                    <button type="button" class="remove-file-btn ms-2" onclick="removeFileCrear()" title="Quitar archivo">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
        `;
        
        filePreviewCrear.innerHTML = previewHTML;
        filePreviewCrear.style.display = 'block';
        
        const dropText = dropZoneCrear.querySelector('.drop-text');
        const dropSubtext = dropZoneCrear.querySelector('.drop-subtext');
        const dropIcon = dropZoneCrear.querySelector('i');
        
        dropIcon.style.color = 'var(--primary-orange)';
        dropText.innerHTML = `<span style="color: var(--primary-orange); font-weight: 600;">Imagen seleccionada</span>`;
        dropSubtext.innerHTML = `<span style="color: var(--primary-orange);" title="${fileName}">${displayName}</span>`;
    };
    reader.readAsDataURL(file);
}

/* ===== FUNCIÓN PARA QUITAR ARCHIVO EN CREAR ===== */
function removeFileCrear() {
    const imagenInput = document.getElementById('imagenInputCrear');
    const filePreview = document.getElementById('filePreviewCrear');
    const dropZone = document.getElementById('dropZoneCrear');
    
    if (imagenInput) {
        imagenInput.value = '';
    }
    
    if (filePreview) {
        filePreview.innerHTML = '<p class="text-muted small m-0">Selecciona una imagen para el curso</p>';
        filePreview.style.display = 'block';
    }
    
    if (dropZone) {
        const dropIcon = dropZone.querySelector('i');
        const dropText = dropZone.querySelector('.drop-text');
        const dropSubtext = dropZone.querySelector('.drop-subtext');
        
        dropIcon.style.color = '#adb5bd';
        dropText.innerHTML = 'Arrastra y suelta la imagen aquí';
        dropSubtext.innerHTML = 'o haz clic para seleccionar';
    }
}

/* ===== FUNCIÓN PARA FORMATEAR EL TAMAÑO DEL ARCHIVO ===== */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/* ===== ZONA DE ARRASTRE PARA EDITAR CURSO ===== */
function setupDropZoneEdit(cursoId) {
    const dropZone = document.getElementById(`dropZoneEditar${cursoId}`);
    const imagenInput = document.getElementById(`imagenInputEditar${cursoId}`);
    const filePreview = document.getElementById(`filePreviewEditar${cursoId}`);
    
    if (!dropZone || !imagenInput) return;
    
    dropZone.addEventListener('click', () => {
        imagenInput.click();
    });

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
            const file = files[0];
            handleFileSelectionEdit(file, cursoId);
            
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imagenInput.files = dataTransfer.files;
        }
    });
    
    if (imagenInput) {
        imagenInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileSelectionEdit(file, cursoId);
            }
        });
    }
}

/* ===== FUNCIÓN PARA MANEJAR LA SELECCIÓN DE ARCHIVOS EN EDITAR ===== */
function handleFileSelectionEdit(file, cursoId) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
        mostrarAlertaError('Tipo de archivo no permitido. Por favor, sube una imagen JPG, JPEG o PNG.');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        mostrarAlertaError('La imagen es demasiado grande. El tamaño máximo es 5MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const filePreview = document.getElementById(`filePreviewEditar${cursoId}`);
        const dropZone = document.getElementById(`dropZoneEditar${cursoId}`);
        
        if (filePreview && dropZone) {
            let fileName = file.name;
            let displayName = file.name;
            
            if (fileName.length > 35) {
                displayName = fileName.substring(0, 32) + '...';
            }
            
            const previewHTML = `
                <div class="file-preview-item uploaded" id="filePreviewItemEditar${cursoId}">
                    <div class="file-info">
                        <i class="bi bi-file-earmark-image" style="color: #F39C12; font-size: 1.4rem;"></i>
                        <div style="flex: 1; min-width: 0; overflow: hidden;">
                            <div class="file-name" title="${fileName}">${displayName}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <div class="file-status">
                        <span class="upload-success"><i class="bi bi-check-circle"></i> Nueva imagen</span>
                        <button type="button" class="remove-file-btn ms-2" onclick="removeFileEdit(${cursoId})" title="Quitar archivo">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            `;
            
            filePreview.innerHTML = previewHTML;
            filePreview.style.display = 'block';
            
            const dropText = dropZone.querySelector('.drop-text');
            const dropSubtext = dropZone.querySelector('.drop-subtext');
            const dropIcon = dropZone.querySelector('i');
            const currentImage = dropZone.querySelector('img');
            
            if (currentImage) {
                currentImage.style.display = 'none';
                dropZone.querySelector('.text-muted.small').style.display = 'none';
            }
            
            if (dropIcon) {
                dropIcon.style.color = 'var(--primary-orange)';
            }
            
            dropText.innerHTML = `<span style="color: var(--primary-orange); font-weight: 600;">Nueva imagen seleccionada</span>`;
            dropSubtext.innerHTML = `<span style="color: var(--primary-orange);" title="${fileName}">${displayName}</span>`;
        }
    };
    reader.readAsDataURL(file);
}

/* ===== FUNCIÓN PARA QUITAR ARCHIVO EN EDITAR ===== */
function removeFileEdit(cursoId) {
    const imagenInput = document.getElementById(`imagenInputEditar${cursoId}`);
    const filePreview = document.getElementById(`filePreviewEditar${cursoId}`);
    const dropZone = document.getElementById(`dropZoneEditar${cursoId}`);
    
    if (imagenInput) {
        imagenInput.value = '';
    }
    
    if (filePreview) {
        filePreview.style.display = 'none';
    }
    
    if (dropZone) {
        const dropIcon = dropZone.querySelector('i');
        const dropText = dropZone.querySelector('.drop-text');
        const dropSubtext = dropZone.querySelector('.drop-subtext');
        const currentImage = dropZone.querySelector('img');
        const currentImageText = dropZone.querySelector('.text-muted.small');
        
        if (currentImage) {
            currentImage.style.display = 'block';
            if (currentImageText) {
                currentImageText.style.display = 'block';
            }
            dropText.innerHTML = 'Arrastra una nueva imagen';
            dropSubtext.innerHTML = 'o haz clic para cambiar';
        } else {
            dropText.innerHTML = 'Arrastra y suelta la imagen aquí';
            dropSubtext.innerHTML = 'o haz clic para seleccionar';
        }
        
        if (dropIcon) {
            dropIcon.style.color = '#adb5bd';
        }
    }
}

/* ===== FUNCIÓN PARA MOSTRAR ALERTA DE ERROR ===== */
function mostrarAlertaError(mensaje) {
    const alertContainer = document.querySelector('.alert-container');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div id="${alertId}" class="alert-toast error">
            <div class="alert-toast-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <div class="alert-toast-content">
                <div class="alert-toast-title">¡Error!</div>
                <div class="alert-toast-message">${mensaje}</div>
            </div>
            <button class="alert-toast-close" onclick="removeAlertToast(this.parentElement)">&times;</button>
            <div class="alert-toast-progress" style="color: var(--alert-error)"></div>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('afterbegin', alertHTML);
    
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            removeAlertToast(alert);
        }
    }, 5000);
}

/* ===== CONFIGURAR ZONAS DE ARRASTRE ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Configurar zonas de arrastre si hay cursos
    if (typeof djangoVariables !== 'undefined' && djangoVariables.cursos_ids) {
        djangoVariables.cursos_ids.forEach(cursoId => {
            setupDropZoneEdit(cursoId);
        });
    }
    
    // Auto-focus en el primer campo del formulario de crear
    if (typeof djangoVariables !== 'undefined' && djangoVariables.mostrar_modal_crear) {
        setTimeout(() => {
            const modalCrear = document.getElementById('modalCrearCurso');
            if (modalCrear) {
                const firstInput = modalCrear.querySelector('input[name="nombre"]');
                if (firstInput) firstInput.focus();
            }
        }, 300);
    }
    
    // Ajustar el texto truncado en las zonas de arrastre
    function adjustDropZoneText() {
        document.querySelectorAll('.drop-zone .drop-subtext').forEach(textElement => {
            const text = textElement.textContent || textElement.innerText;
            if (text.length > 35) {
                const truncated = text.substring(0, 32) + '...';
                textElement.textContent = truncated;
                textElement.title = text;
            }
        });
    }
    
    // Ejecutar ajuste inicial
    setTimeout(adjustDropZoneText, 100);
});
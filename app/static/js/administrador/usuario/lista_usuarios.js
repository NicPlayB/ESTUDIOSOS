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

document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
});

/* ================= CSRF TOKEN ================= */
function getCSRFToken() {
    // Primero buscar en meta tag
    const metaToken = document.querySelector('meta[name="csrfmiddlewaretoken"]');
    if (metaToken) return metaToken.content;
    
    // Buscar en forms
    const formToken = document.querySelector('[name="csrfmiddlewaretoken"]');
    if (formToken) return formToken.value;
    
    // Buscar cualquier input csrf
    const allTokens = document.querySelectorAll('[name="csrfmiddlewaretoken"]');
    if (allTokens.length > 0) return allTokens[0].value;
    
    console.warn("No se pudo encontrar el token CSRF");
    return '';
}

function injectCSRF() {
    const token = getCSRFToken();
    if (!token) {
        console.error("No hay token CSRF disponible para inyectar");
        return;
    }
    
    const tablaUsuarios = document.getElementById('tablaUsuarios');
    if (!tablaUsuarios) return;
    
    tablaUsuarios.querySelectorAll("form").forEach(form => {
        if (!form.querySelector('[name="csrfmiddlewaretoken"]')) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "csrfmiddlewaretoken";
            input.value = token;
            form.prepend(input);
        }
    });
}

/* ================= FUNCIÓN PARA AJUSTAR VISIBILIDAD ================= */
function adjustTableVisibility() {
    const tableContainer = document.querySelector('.table-container');
    const cardsContainer = document.querySelector('.cards-container');
    
    if (!tableContainer || !cardsContainer) return;
    
    if (window.innerWidth > 768) {
        tableContainer.style.display = 'block';
        cardsContainer.style.display = 'none';
    } else {
        tableContainer.style.display = 'none';
        cardsContainer.style.display = 'block';
    }
}

/* ================= LIVE SEARCH ================= */
const searchInput = document.getElementById("searchInput");
const rolSelect = document.getElementById("rolSelect");

let searchTimer;
const searchDelay = 400;

function liveSearch() {
    const params = new URLSearchParams({
        search: searchInput.value,
        rol: rolSelect.value
    });

    fetch(`?${params.toString()}`, {
        headers: { 
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": getCSRFToken()
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
    })
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const nuevaTabla = doc.querySelector('#tablaUsuarios');
        
        if (nuevaTabla) {
            document.getElementById('tablaUsuarios').innerHTML = nuevaTabla.innerHTML;
        } else {
            document.getElementById('tablaUsuarios').innerHTML = html;
        }
        
        setTimeout(() => {
            adjustTableVisibility();
        }, 100);
        
        injectCSRF();
        setupUpdateButtons();
    })
    .catch(error => {
        console.error('Error en la búsqueda:', error);
        // Si falla la búsqueda AJAX, recargar la página
        window.location.search = params.toString();
    });
}

if (searchInput && rolSelect) {
    searchInput.addEventListener("keyup", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(liveSearch, searchDelay);
    });

    rolSelect.addEventListener("change", liveSearch);

    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", e => {
            e.preventDefault();
            liveSearch();
        });
    }
}

/* ================= MODAL MANAGEMENT ================= */
let currentForm = null;

function setupUpdateButtons() {
    document.querySelectorAll(".btn-update-role").forEach(button => {
        button.onclick = function(e) {
            e.preventDefault();
            
            const form = this.closest('form');
            const usuarioId = form.querySelector('input[name="usuario_id"]').value;
            
            let usuarioNombre, usuarioRolActual;
            const tableRow = form.closest('tr');
            const cardItem = form.closest('.card-item');
            
            if (tableRow) {
                const userInfo = tableRow.querySelector('td:nth-child(1) .user-info');
                const roleCell = tableRow.querySelector('td:nth-child(3)');
                
                if (userInfo) usuarioNombre = userInfo.textContent.trim();
                if (roleCell) {
                    // Remover el icono y espacios extras
                    const roleText = roleCell.textContent || roleCell.innerText;
                    usuarioRolActual = roleText.replace('shields-up', '').trim();
                }
            } else if (cardItem) {
                const paragraphs = cardItem.querySelectorAll('p');
                if (paragraphs[0]) {
                    const nombreSpan = paragraphs[0].querySelector('span');
                    if (nombreSpan) usuarioNombre = nombreSpan.textContent.trim();
                }
                if (paragraphs[2]) {
                    const rolSpan = paragraphs[2].querySelector('span');
                    if (rolSpan) usuarioRolActual = rolSpan.textContent.trim();
                }
            }
            
            const nuevoRol = form.querySelector('select[name="nuevo_rol"]');
            const nuevoRolTexto = nuevoRol ? nuevoRol.options[nuevoRol.selectedIndex].text : '';
            
            currentForm = form;
            
            const userDetails = document.getElementById('userDetails');
            if (userDetails) {
                userDetails.innerHTML = 
                    `<p><i class="bi bi-person"></i> <strong>Usuario:</strong> ${usuarioNombre || 'No disponible'}</p>
                     <p><i class="bi bi-shield"></i> <strong>Rol actual:</strong> ${usuarioRolActual || 'No disponible'}</p>
                     <p><i class="bi bi-arrow-right-circle"></i> <strong>Nuevo rol:</strong> ${nuevoRolTexto || 'No disponible'}</p>`;
            }
            
            const modalElement = document.getElementById('confirmationModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        };
    });
}

/* ================= CONFIRMATION MODAL ================= */
const confirmUpdateBtn = document.getElementById('confirmUpdate');
if (confirmUpdateBtn) {
    confirmUpdateBtn.addEventListener('click', async function() {
        if (currentForm) {
            const formData = new FormData(currentForm);
            const csrfToken = getCSRFToken();
            
            if (!csrfToken) {
                alert('Error de seguridad: No se encontró el token CSRF. Por favor, recarga la página.');
                return;
            }
            
            const submitBtn = this;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i>Actualizando...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(currentForm.action, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const contentType = response.headers.get("content-type");
                let result;
                
                if (contentType && contentType.includes("application/json")) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        result = JSON.parse(text);
                    } catch (e) {
                        console.warn("Respuesta no es JSON, recargando página...");
                        location.reload();
                        return;
                    }
                }
                
                if (result.success) {
                    const modalElement = document.getElementById('confirmationModal');
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                        }
                    }
                    
                    mostrarModalExito(result.message || 'Rol actualizado correctamente');
                    
                    // Refrescar la tabla después de actualizar
                    setTimeout(() => {
                        liveSearch();
                    }, 1500);
                } else {
                    alert('Error al actualizar el rol: ' + (result.message || 'Error desconocido'));
                }
            } catch (error) {
                console.error('Error en la petición:', error);
                
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    // Si hay error de conexión, hacer submit normal del form
                    currentForm.submit();
                } else {
                    alert('Error: ' + error.message);
                }
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}

/* ================= MODAL DE ÉXITO ================= */
function mostrarModalExito(msg) {
    const mensajeExito = document.getElementById('mensajeExito');
    if (mensajeExito) {
        mensajeExito.textContent = msg;
    }
    
    const modalElement = document.getElementById('modalExito');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        
        modalElement.addEventListener('hidden.bs.modal', function () {
            // Solo recargar si estamos en una búsqueda
            if (searchInput.value || rolSelect.value) {
                liveSearch();
            }
        }, { once: true });
        
        modal.show();
    }
}

/* ================= MANEJO DE MENSAJES DE DJANGO ================= */
function handleDjangoMessages() {
    // Verificar si hay mensajes de Django definidos
    if (typeof djangoMessages !== 'undefined' && djangoMessages.length > 0) {
        djangoMessages.forEach(function(msg) {
            if (msg.tags === 'success') {
                setTimeout(function() {
                    mostrarModalExito(msg.message);
                }, 100);
            }
        });
    }
}

/* ================= INITIALIZATION ================= */
document.addEventListener("DOMContentLoaded", function() {
    // Ajustar visibilidad de tabla/cards
    adjustTableVisibility();
    
    // Escuchar cambios en el tamaño de ventana
    window.addEventListener('resize', adjustTableVisibility);
    
    // Inyectar CSRF token en los forms dinámicos
    injectCSRF();
    
    // Configurar botones de actualización
    setupUpdateButtons();
    
    // Manejar mensajes de Django
    handleDjangoMessages();
    
    // Cerrar automáticamente alertas después de 5 segundos
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert-auto-close');
        alerts.forEach(function(alert) {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        });
    }, 5000);
    
    // Para Render, asegurarnos de que los eventos están vinculados
    console.log('Script cargado correctamente');
});
// ===== FUNCIONALIDAD PARA LAS NUEVAS ALERTAS CLEAN (BORDE) =====
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

// ===== VARIABLES GLOBALES =====
let claseId = null;
let usuarioId = null;

// ===== FUNCIÓN PARA OBTENER EL TOKEN CSRF =====
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// ===== INICIALIZACIÓN DE VARIABLES WEBSOCKET =====
function initWebSocket() {
    const claseIdElement = document.getElementById('comentarios-lista');
    if (!claseIdElement) return;
    
    claseId = claseIdElement.getAttribute('data-clase-id');
    usuarioId = claseIdElement.getAttribute('data-usuario-id');
    
    if (!claseId) return;
    
    // ===== WEBSOCKET CONNECTION =====
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(
        wsScheme + "://" + window.location.host + "/ws/comentarios/clase/" + claseId + "/"
    );

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);

        if (data.action === "refresh") {
            const cont = document.getElementById("comentarios-lista");
            cont.innerHTML = data.html;
            aplicarEstilos();
            activarMenus();
            scrollBottom();
        }
    };

    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    socket.onclose = function() {
        console.log("WebSocket connection closed");
        // Intentar reconectar después de 3 segundos
        setTimeout(initWebSocket, 3000);
    };
}

// ===== FUNCIONES DE ESTILOS =====
function aplicarEstilos() {
    if (!usuarioId) return;
    
    document.querySelectorAll(".comentario").forEach(c => {
        const comentarioUsuarioId = c.getAttribute('data-usuario-id');
        c.classList.toggle("mio", comentarioUsuarioId == usuarioId);
        c.classList.toggle("otro", comentarioUsuarioId != usuarioId);
        
        // Asegurar que solo los comentarios propios muestren el menú
        const menuBtn = c.querySelector(".menu-btn");
        if (menuBtn) {
            menuBtn.style.display = comentarioUsuarioId == usuarioId ? "flex" : "none";
        }
    });
}

function activarMenus() {
    if (!usuarioId) return;
    
    document.querySelectorAll(".comentario").forEach(comentario => {
        const autorId = comentario.getAttribute('data-usuario-id');
        if (autorId != usuarioId) return;

        const menuBtn = comentario.querySelector(".menu-btn");
        const dropdown = comentario.querySelector(".dropdown-menu");

        if (menuBtn && dropdown) {
            menuBtn.onclick = e => {
                e.stopPropagation();
                document.querySelectorAll(".dropdown-menu").forEach(m => m.style.display = "none");
                dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
            };

            const editarBtn = dropdown.querySelector(".editar-btn");
            const eliminarBtn = dropdown.querySelector(".eliminar-btn");
            
            if (editarBtn) {
                editarBtn.onclick = () => editarComentario(comentario);
            }
            
            if (eliminarBtn) {
                eliminarBtn.onclick = () =>
                    eliminarComentario(comentario.getAttribute('data-comentario-id'));
            }
        }
    });

    document.body.onclick = () =>
        document.querySelectorAll(".dropdown-menu").forEach(m => m.style.display = "none");
}

function editarComentario(comentario) {
    const texto = comentario.querySelector(".texto-comentario").innerText;
    const inputDescripcion = document.getElementById("descripcion");
    const comentarioIdInput = document.getElementById("comentario_id");
    const btnEnviar = document.getElementById("btn-enviar");
    const btnCancelar = document.getElementById("btn-cancelar");

    if (inputDescripcion && comentarioIdInput && btnEnviar && btnCancelar) {
        inputDescripcion.value = texto;
        comentarioIdInput.value = comentario.getAttribute('data-comentario-id');

        btnEnviar.innerHTML = '<i class="bi bi-pencil"></i> Modificar';
        btnEnviar.name = "editar";

        btnCancelar.style.display = "flex";
        inputDescripcion.focus();
    }
}

function configurarCancelar() {
    const btnCancelar = document.getElementById("btn-cancelar");
    if (btnCancelar) {
        btnCancelar.onclick = () => {
            const inputDescripcion = document.getElementById("descripcion");
            const comentarioIdInput = document.getElementById("comentario_id");
            const btnEnviar = document.getElementById("btn-enviar");

            if (inputDescripcion && comentarioIdInput && btnEnviar) {
                inputDescripcion.value = "";
                comentarioIdInput.value = "";

                btnEnviar.innerHTML = '<i class="bi bi-send"></i> Enviar';
                btnEnviar.name = "crear";

                btnCancelar.style.display = "none";
            }
        };
    }
}

function eliminarComentario(comentarioId) {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

    // Usar Fetch API para enviar la solicitud de eliminación
    const formData = new FormData();
    formData.append('comentario_id', comentarioId);
    formData.append('eliminar', '1');
    formData.append('csrfmiddlewaretoken', csrftoken);

    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        }
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.json();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar el comentario. Por favor, recarga la página e intenta nuevamente.');
    });
}

function scrollBottom() {
    const cont = document.getElementById("comentarios-lista");
    if (cont) {
        cont.scrollTop = cont.scrollHeight;
    }
}

// ===== ENFOQUE AUTOMÁTICO EN EL INPUT =====
function configurarInput() {
    const inputDescripcion = document.getElementById("descripcion");
    const btnEnviar = document.getElementById("btn-enviar");
    
    if (inputDescripcion && btnEnviar) {
        inputDescripcion.focus();
        
        // Enviar con Enter
        inputDescripcion.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                btnEnviar.click();
            }
        });
    }
}

// ===== INICIALIZACIÓN COMPLETA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar WebSocket
    initWebSocket();
    
    // Configurar funciones
    aplicarEstilos();
    activarMenus();
    configurarCancelar();
    configurarInput();
    scrollBottom();
    
    // Configurar el envío del formulario principal para evitar recarga completa
    const formComentario = document.getElementById('form-comentario');
    if (formComentario) {
        formComentario.addEventListener('submit', function(e) {
            // Si ya estamos editando o creando con WebSocket, no necesitamos prevenir el envío
            // El formulario se enviará normalmente al servidor
        });
    }
});
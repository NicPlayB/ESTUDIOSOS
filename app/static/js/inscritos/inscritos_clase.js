// inscritos.js

// ===== FUNCIONALIDAD DEL NUEVO SISTEMA DE ALERTAS CLEAN (BORDE) =====
function removeAlertToast(toastElement) {
    if (!toastElement.parentElement) return;
    
    toastElement.classList.add('hide');
    
    toastElement.addEventListener('animationend', () => {
        if (toastElement.parentElement) {
            toastElement.remove();
        }
    });
}

// ===== MANEJO DEL SIDEBAR =====
function initSidebar() {
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

    // Event listeners para sidebar
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

    // Cerrar nav cuando se redimensiona la ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeNav();
        }
    });
}

// ===== FUNCIONES PARA NOTIFICACIONES =====
function showNewInscritoNotification(cantidad) {
    const alertContainer = document.querySelector('.alert-container');
    
    const alertToast = document.createElement('div');
    alertToast.className = 'alert-toast success';
    alertToast.innerHTML = `
        <div class="alert-toast-icon">
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        </div>
        <div class="alert-toast-content">
            <div class="alert-toast-title">Nuevo Inscrito</div>
            <div class="alert-toast-message">¡${cantidad} nuevo${cantidad > 1 ? 's' : ''} estudiante${cantidad > 1 ? 's' : ''} ${cantidad > 1 ? 'se han unido' : 'se ha unido'} a la clase!</div>
        </div>
        <button class="alert-toast-close">&times;</button>
        <div class="alert-toast-progress" style="color: #2ecc71"></div>
    `;
    
    alertContainer.appendChild(alertToast);
    
    // Agregar funcionalidad al botón de cierre
    const closeBtn = alertToast.querySelector('.alert-toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            removeAlertToast(alertToast);
        });
    }
    
    // Auto-cierre después de 5 segundos
    setTimeout(() => {
        removeAlertToast(alertToast);
    }, 5000);
}

function applyTableStyles() {
    // Aplicar efecto hover a las filas de la tabla
    const tableRows = document.querySelectorAll('.table-modern tbody tr');
    tableRows.forEach((row, index) => {
        // Si es la última fila (posiblemente nuevo inscrito), aplicar animación
        if (index === tableRows.length - 1 && tableRows.length > 1) {
            row.classList.add('new-inscrito');
            
            // Remover clase después de la animación
            setTimeout(() => {
                row.classList.remove('new-inscrito');
            }, 2000);
        }
    });
}

// ===== FUNCIONES GENERALES =====
function copiarCodigoClase(codigo) {
    navigator.clipboard.writeText(codigo).then(function() {
        // Crear alerta con el nuevo diseño Clean (Borde)
        const alertContainer = document.querySelector('.alert-container');
        
        const alertToast = document.createElement('div');
        alertToast.className = 'alert-toast info';
        alertToast.innerHTML = `
            <div class="alert-toast-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            </div>
            <div class="alert-toast-content">
                <div class="alert-toast-title">Código copiado</div>
                <div class="alert-toast-message">Código copiado: <strong>${codigo}</strong></div>
            </div>
            <button class="alert-toast-close">&times;</button>
            <div class="alert-toast-progress" style="color: #3498db"></div>
        `;
        
        alertContainer.appendChild(alertToast);
        
        // Agregar funcionalidad al botón de cierre
        const closeBtn = alertToast.querySelector('.alert-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                removeAlertToast(alertToast);
            });
        }
        
        // Auto-cierre después de 3 segundos
        setTimeout(() => {
            removeAlertToast(alertToast);
        }, 3000);
    }).catch(function(err) {
        console.error('Error al copiar:', err);
        
        // Mostrar alerta de error
        const alertContainer = document.querySelector('.alert-container');
        
        const alertToast = document.createElement('div');
        alertToast.className = 'alert-toast error';
        alertToast.innerHTML = `
            <div class="alert-toast-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <div class="alert-toast-content">
                <div class="alert-toast-title">Error</div>
                <div class="alert-toast-message">No se pudo copiar el código al portapapeles</div>
            </div>
            <button class="alert-toast-close">&times;</button>
            <div class="alert-toast-progress" style="color: #e74c3c"></div>
        `;
        
        alertContainer.appendChild(alertToast);
        
        // Agregar funcionalidad al botón de cierre
        const closeBtn = alertToast.querySelector('.alert-toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                removeAlertToast(alertToast);
            });
        }
        
        // Auto-cierre después de 5 segundos
        setTimeout(() => {
            removeAlertToast(alertToast);
        }, 5000);
    });
}

// ===== WEBSOCKET =====
function initWebSocket(claseId, currentInscritosCount) {
    const socket = new WebSocket(
        (window.location.protocol === "https:" ? "wss://" : "ws://") + 
        window.location.host + "/ws/inscritos/clase/" + claseId + "/"
    );

    socket.onopen = () => console.log("✅ Conexión WebSocket establecida para inscritos");
    socket.onclose = () => console.log("❌ Conexión WebSocket cerrada");

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if(data.action === "refresh") {
            console.log("📡 Actualización recibida:", data.count, "inscritos");
            
            // Actualizar la tabla
            const tablaDiv = document.getElementById("tablaInscritos");
            tablaDiv.innerHTML = data.html;
            
            // Actualizar contador
            const countElement = document.getElementById("inscritosCount");
            if (countElement) {
                const plural = data.count !== 1 ? 's' : '';
                countElement.innerHTML = `<i class="bi bi-people-fill"></i>${data.count} inscrito${plural}`;
            }
            
            // Mostrar notificación si hay nuevo inscrito
            if (data.count > currentInscritosCount) {
                showNewInscritoNotification(data.count - currentInscritosCount);
            }
            
            // Reaplicar estilos a la nueva tabla
            applyTableStyles();
            
            return data.count; // Retornar nuevo contador
        }
    };

    return socket;
}

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", function() {
    // Inicializar sistema de alertas existentes
    const alertToasts = document.querySelectorAll('.alert-toast');
    alertToasts.forEach(toast => {
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

    // Inicializar sidebar
    initSidebar();

    // Inicializar tabla
    applyTableStyles();
    
    // Verificar si las variables globales están definidas desde Django
    if (typeof claseId !== 'undefined' && typeof currentInscritosCount !== 'undefined') {
        // Inicializar WebSocket
        const socket = initWebSocket(claseId, currentInscritosCount);
        
        // Reconectar WebSocket si se pierde la conexión
        setInterval(() => {
            if (socket.readyState === WebSocket.CLOSED) {
                console.log('🔄 Reconectando WebSocket...');
                location.reload();
            }
        }, 5000);
    }
});
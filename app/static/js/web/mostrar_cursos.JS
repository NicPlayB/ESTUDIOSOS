// ===== FUNCIONALIDAD PARA ALERTAS ====
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

// ===== FUNCIONALIDAD PARA MODAL DE WHATSAPP - CORREGIDO =====
const whatsappModal = document.getElementById('whatsappModal');
const whatsappModalOverlay = document.getElementById('whatsappModalOverlay');
const whatsappModalClose = document.getElementById('whatsappModalClose');
const whatsappModalCancel = document.getElementById('whatsappModalCancel');
const whatsappModalCourseName = document.getElementById('whatsappModalCourseName');
const whatsappModalLink = document.getElementById('whatsappModalLink');

// Número de WhatsApp (reemplaza con el número real de tu empresa)
const whatsappNumber = '+573162654440'; // Ejemplo: número colombiano

function openWhatsAppModal(courseName) {
    // Actualizar el nombre del curso en el modal
    whatsappModalCourseName.textContent = courseName;
    
    // Crear el mensaje para WhatsApp
    const message = `Hola, estoy interesado en el curso: ${courseName}. ¿Podrían darme más información?`;
    
    // Crear el enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Actualizar el enlace del botón de WhatsApp
    whatsappModalLink.href = whatsappUrl;
    
    // Mostrar el modal
    whatsappModal.classList.add('active');
    whatsappModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeWhatsAppModal() {
    whatsappModal.classList.remove('active');
    whatsappModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners para cerrar el modal
if (whatsappModalClose) {
    whatsappModalClose.addEventListener('click', closeWhatsAppModal);
}

if (whatsappModalCancel) {
    whatsappModalCancel.addEventListener('click', closeWhatsAppModal);
}

if (whatsappModalOverlay) {
    whatsappModalOverlay.addEventListener('click', closeWhatsAppModal);
}

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && whatsappModal.classList.contains('active')) {
        closeWhatsAppModal();
    }
});

// ===== FUNCIONALIDAD DEL MENÚ MÓVIL =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
}

if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', closeMobileMenu);
}

if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
}

mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// ===== FUNCIONALIDAD DEL HEADER AL HACER SCROLL =====
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===== SCROLL SUAVE PARA ENLACES =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== ANIMACIÓN DE ENTRADA PARA LAS CARDS =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar las cards de cursos
document.querySelectorAll('.curso-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ===== EVENT LISTENERS PARA BOTONES DE MÁS INFORMACIÓN =====
const masInfoButtons = document.querySelectorAll('.btn-mas-info');
masInfoButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const cursoNombre = button.getAttribute('data-curso-nombre') || button.textContent;
        openWhatsAppModal(cursoNombre);
        
        // Efecto de click
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
});

// ===== EVENT LISTENER PARA BOTÓN DE ASESORÍA =====
const btnAsesoria = document.getElementById('btnAsesoria');
if (btnAsesoria) {
    btnAsesoria.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsAppModal('Asesoría de Cursos');
    });
}

// ===== MANEJAR EL ENVÍO DE FORMULARIOS DE INSCRIPCIÓN =====
document.querySelectorAll('.formulario-inscripcion').forEach(form => {
    form.addEventListener('submit', function(e) {
        const button = this.querySelector('button[type="submit"]');
        if (button) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            button.disabled = true;
        }
    });
});

// ===== EFECTO PARA BOTONES DE CURSOS =====
const courseButtons = document.querySelectorAll('.btn-inscribirme, .btn-login-curso');
courseButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Efecto de click
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
});

// ===== CORRECCIÓN PARA EVITAR INTERFERENCIA DEL MODAL =====
// Asegurar que el modal no interfiera con el hover de las cards
document.addEventListener('DOMContentLoaded', function() {
    // Forzar que el modal esté completamente oculto cuando no esté activo
    const modal = document.getElementById('whatsappModal');
    const overlay = document.getElementById('whatsappModalOverlay');
    
    if (modal && overlay) {
        // Asegurar que no haya eventos del mouse en el modal cuando está oculto
        modal.style.pointerEvents = 'none';
        overlay.style.pointerEvents = 'none';
        
        // Cuando el modal se active, permitir eventos
        const originalOpenModal = openWhatsAppModal;
        window.openWhatsAppModal = function(courseName) {
            originalOpenModal(courseName);
            modal.style.pointerEvents = 'auto';
            overlay.style.pointerEvents = 'auto';
        };
        
        // Cuando se cierre el modal, desactivar eventos
        const closeFunctions = [closeWhatsAppModal];
        closeFunctions.forEach(func => {
            const originalClose = func;
            window[func.name] = function() {
                originalClose();
                setTimeout(() => {
                    modal.style.pointerEvents = 'none';
                    overlay.style.pointerEvents = 'none';
                }, 300);
            };
        });
    }
});
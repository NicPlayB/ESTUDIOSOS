// ===== FUNCIONALIDAD PARA ALERTAS =====
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

// Mobile Menu Toggle - MISMA LÓGICA DEL CÓDIGO 1
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

// Header Scroll Effect - MISMA LÓGICA DEL CÓDIGO 1
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scrolling - MISMA LÓGICA DEL CÓDIGO 1
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

// Animación de entrada para las cards
const observerOptions = {
    threshold: 0.15,
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

// Observar las cards de noticias y cursos
document.querySelectorAll('.news-card, .curso-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Efecto para botones
const newsButtons = document.querySelectorAll('.btn-news');
newsButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Efecto de click
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
        // Si el botón no tiene un onclick específico, prevenir acción por defecto
        if (!button.hasAttribute('onclick') && !button.getAttribute('href')) {
            e.preventDefault();
        }
    });
});

// Efecto de entrada para secciones
const sectionHeaders = document.querySelectorAll('.section-header');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, { threshold: 0.3 });

sectionHeaders.forEach(header => {
    header.style.opacity = '0';
    header.style.transform = 'translateX(-20px)';
    header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    sectionObserver.observe(header);
});

// Función para abrir el modal de WhatsApp desde cualquier lugar
window.openWhatsAppModal = openWhatsAppModal;

// CORRECCIÓN PARA EVITAR INTERFERENCIA DEL MODAL
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('whatsappModal');
    const overlay = document.getElementById('whatsappModalOverlay');
    
    if (modal && overlay) {
        modal.style.pointerEvents = 'none';
        overlay.style.pointerEvents = 'none';
        
        const originalOpenModal = openWhatsAppModal;
        window.openWhatsAppModal = function(courseName) {
            originalOpenModal(courseName);
            modal.style.pointerEvents = 'auto';
            overlay.style.pointerEvents = 'auto';
        };
        
        const originalCloseModal = closeWhatsAppModal;
        window.closeWhatsAppModal = function() {
            originalCloseModal();
            setTimeout(() => {
                modal.style.pointerEvents = 'none';
                overlay.style.pointerEvents = 'none';
            }, 300);
        };
    }
});
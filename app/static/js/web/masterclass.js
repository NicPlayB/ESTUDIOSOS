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

// ===== FUNCIONALIDAD PARA MODAL DE WHATSAPP =====
const whatsappModal = document.getElementById('whatsappModal');
const whatsappModalOverlay = document.getElementById('whatsappModalOverlay');
const whatsappModalClose = document.getElementById('whatsappModalClose');
const whatsappModalCancel = document.getElementById('whatsappModalCancel');
const whatsappModalCourseName = document.getElementById('whatsappModalCourseName');
const whatsappModalLink = document.getElementById('whatsappModalLink');
    
// Número de WhatsApp (reemplaza con el número real de tu empresa)
const whatsappNumber = '+573162654440'; // Ejemplo: número colombiano
    
function openWhatsAppModal(masterclassName) {
    // Actualizar el nombre de la masterclass en el modal
    whatsappModalCourseName.textContent = masterclassName;
    
    // Crear el mensaje para WhatsApp
    const message = `Hola, estoy interesado en: ${masterclassName}. ¿Podrían darme más información?`;
    
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

// ===== FUNCIONALIDAD DEL MENÚ MÓVIL IDÉNTICO AL CÓDIGO 1 =====
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

// ===== FUNCIONALIDAD DEL HEADER AL HACER SCROLL IDÉNTICO AL CÓDIGO 1 =====
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

// ===== INTERSECTION OBSERVER PARA ANIMACIONES =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

const targetImage = document.getElementById('targetImage');
const methodologyImage = document.getElementById('methodologyImage');

if (targetImage) observer.observe(targetImage);
if (methodologyImage) observer.observe(methodologyImage);

// ===== EFECTO PARA BOTONES =====
const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-white');
ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Efecto de click
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
});

// ===== CORRECCIÓN PARA EVITAR INTERFERENCIA DEL MODAL =====
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('whatsappModal');
    const overlay = document.getElementById('whatsappModalOverlay');
    
    if (modal && overlay) {
        modal.style.pointerEvents = 'none';
        overlay.style.pointerEvents = 'none';
        
        const originalOpenModal = openWhatsAppModal;
        window.openWhatsAppModal = function(masterclassName) {
            originalOpenModal(masterclassName);
            modal.style.pointerEvents = 'auto';
            overlay.style.pointerEvents = 'auto';
        };
        
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
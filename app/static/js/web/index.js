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
    const message = `Hola, estoy interesado en: ${courseName}. ¿Podrían darme más información?`;
    
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

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        document.body.classList.remove('loading');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
});

// Mobile Menu Toggle
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

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth Scrolling
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

// Hero Carousel
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.carousel-dot');
const totalSlides = slides.length;
let autoplayInterval;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 6000);
}

function stopAutoplay() {
    clearInterval(autoplayInterval);
}

if (document.querySelector('.next-arrow')) {
    document.querySelector('.next-arrow').addEventListener('click', () => {
        stopAutoplay();
        nextSlide();
        startAutoplay();
    });
}

if (document.querySelector('.prev-arrow')) {
    document.querySelector('.prev-arrow').addEventListener('click', () => {
        stopAutoplay();
        prevSlide();
        startAutoplay();
    });
}

if (dots.length > 0) {
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoplay();
            currentSlide = index;
            showSlide(currentSlide);
            startAutoplay();
        });
    });
}

startAutoplay();

const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);
}

// Intersection Observer for Animations
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

const aboutImage = document.getElementById('aboutImage');
const whoImage = document.getElementById('whoImage');
const objectiveImage = document.getElementById('objectiveImage');

if (aboutImage) observer.observe(aboutImage);
if (whoImage) observer.observe(whoImage);
if (objectiveImage) observer.observe(objectiveImage);

// Counter Animation
const counters = document.querySelectorAll('.counter');
const counterOptions = {
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const increment = target / (duration / 16);

            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
            counterObserver.unobserve(counter);
        }
    });
}, counterOptions);

counters.forEach(counter => {
    counterObserver.observe(counter);
});

// Testimonials - Nueva funcionalidad mejorada
const testimonialsWrapper = document.getElementById('testimonialsWrapper');
const testimonialsTrack = document.getElementById('testimonialsTrack');
const testimonialCards = document.querySelectorAll('.testimonial-card');
let isPausedGlobal = false;
let currentZoomedCard = null;
let wrapperClickTimeout = null;

// Click en una card individual - zoom y pausa
if (testimonialCards.length > 0) {
    testimonialCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que se propague al wrapper
            
            // Si hay una card con zoom, la quitamos
            if (currentZoomedCard && currentZoomedCard !== card) {
                currentZoomedCard.classList.remove('zoomed');
            }
            
            // Toggle zoom en la card actual
            card.classList.toggle('zoomed');
            
            // Actualizar la referencia
            if (card.classList.contains('zoomed')) {
                currentZoomedCard = card;
                testimonialsTrack.classList.add('paused');
            } else {
                currentZoomedCard = null;
                testimonialsTrack.classList.remove('paused');
            }
        });
    });
}

// Click en el contenedor (no en las cards) - mantener presionado para pausar
if (testimonialsWrapper) {
    testimonialsWrapper.addEventListener('mousedown', (e) => {
        // Solo si no se clickeó una card
        if (e.target === testimonialsWrapper || e.target === testimonialsTrack) {
            wrapperClickTimeout = setTimeout(() => {
                isPausedGlobal = !isPausedGlobal;
                if (isPausedGlobal) {
                    testimonialsTrack.classList.add('paused');
                } else {
                    testimonialsTrack.classList.remove('paused');
                    // Quitar zoom de cualquier card
                    if (currentZoomedCard) {
                        currentZoomedCard.classList.remove('zoomed');
                        currentZoomedCard = null;
                    }
                }
            }, 200); // 200ms de presión para activar
        }
    });

    testimonialsWrapper.addEventListener('mouseup', () => {
        clearTimeout(wrapperClickTimeout);
    });

    testimonialsWrapper.addEventListener('mouseleave', () => {
        clearTimeout(wrapperClickTimeout);
    });
}

// Click fuera de las cards para quitar zoom
document.addEventListener('click', (e) => {
    if (testimonialsWrapper && !testimonialsWrapper.contains(e.target)) {
        if (currentZoomedCard) {
            currentZoomedCard.classList.remove('zoomed');
            currentZoomedCard = null;
            testimonialsTrack.classList.remove('paused');
        }
    }
});

// ===== EVENT LISTENERS PARA BOTONES DE WHATSAPP =====
const whatsappButtons = document.querySelectorAll('.btn-secondary[data-info]');
whatsappButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const infoText = button.getAttribute('data-info');
        openWhatsAppModal(infoText);
        
        // Efecto de click
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
});

// ===== EVENT LISTENER PARA BOTÓN DE INSCRIPCIÓN =====
const btnInscribete = document.getElementById('btnInscribete');
if (btnInscribete) {
    btnInscribete.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsAppModal('Inscripción a Estudiosos');
    });
}

// ===== EFECTO PARA BOTONES DEL CAROUSEL =====
const carouselButtons = document.querySelectorAll('.carousel-arrow, .carousel-dot');
carouselButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Efecto de click
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
});

// ===== ANIMACIÓN PARA TARJETAS DE CURSOS =====
const courseCards = document.querySelectorAll('.course-card');
courseCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.transition = 'transform 0.4s ease';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// ===== FUNCIONALIDAD PARA MODO BANNERS =====
const modeBanners = document.querySelectorAll('.mode-banner');
modeBanners.forEach(banner => {
    banner.addEventListener('mouseenter', () => {
        banner.style.transform = 'translateY(-10px)';
        banner.style.boxShadow = '0 20px 50px rgba(37, 37, 38, 0.15)';
    });
    
    banner.addEventListener('mouseleave', () => {
        banner.style.transform = 'translateY(0)';
        banner.style.boxShadow = 'none';
    });
});

// ===== FUNCIONALIDAD PARA TARJETAS DE POR QUÉ ELEGIRNOS =====
const whyItems = document.querySelectorAll('.why-item');
whyItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-10px)';
        item.style.boxShadow = '0 15px 40px rgba(207, 66, 57, 0.2)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0)';
        item.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.08)';
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
        window.openWhatsAppModal = function(courseName) {
            originalOpenModal(courseName);
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
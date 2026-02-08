// static/js/lista_inscritos.js

/* ================= SIDEBAR ================= */
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

    /* ================= MODAL WHATSAPP ================= */
    const enlaces = document.querySelectorAll('.abrir-whatsapp');
    const confirmarWhatsapp = document.getElementById('confirmarWhatsapp');
    const userDetails = document.getElementById('userDetailsWhatsapp');
    const confirmWhatsappModal = document.getElementById('confirmWhatsappModal');
    
    if (confirmWhatsappModal) {
        const myModal = new bootstrap.Modal(confirmWhatsappModal);

        enlaces.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const celular = this.getAttribute('data-cel');
                const curso = this.getAttribute('data-curso');
                const nombre = this.getAttribute('data-nombre');

                // Actualizar detalles en el modal
                userDetails.innerHTML = 
                    `<p><i class="bi bi-person"></i> <strong>Usuario:</strong> ${nombre}</p>
                     <p><i class="bi bi-phone"></i> <strong>Celular:</strong> ${celular}</p>
                     <p><i class="bi bi-book"></i> <strong>Curso:</strong> ${curso}</p>`;

                // Crear el enlace de WhatsApp
                const mensaje = `Hola ${encodeURIComponent(nombre)}, te contacto por el curso ${encodeURIComponent(curso)}`;
                const whatsappUrl = `https://wa.me/57${celular}?text=${encodeURIComponent(mensaje)}`;
                
                confirmarWhatsapp.href = whatsappUrl;

                // Mostrar el modal
                myModal.show();
            });
        });
    }

    /* ================= CERRAR AUTOMÁTICAMENTE ALERTAS ================= */
    // Cerrar automáticamente alertas después de 5 segundos
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert-auto-close');
        alerts.forEach(function(alert) {
            var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        });
    }, 5000);
});
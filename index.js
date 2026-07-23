/**
 * Archivo: index.js
 * Descripción: Script de control dinámico para el sitio web multipágina de Torre Inversiones.
 *              Maneja el comportamiento del navbar al hacer scroll, el menú responsive,
 *              las animaciones de conteo de estadísticas, revelado de elementos por scroll,
 *              el filtro de propiedades y la validación del formulario de contacto.
 * Última modificación: 2026-06-30
 * Autor: Antigravity AI
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================
       1. EFECTO DE SCROLL EN NAVBAR
       ========================================== */
    const header = document.querySelector('.header');
    const handleScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar en carga por si hay scroll previo

    /* ==========================================
       2. MENÚ MÓVIL RESPONSIVE
       ========================================== */
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Cambiar icono de hamburguesa a X
            const icon = navToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('open')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Cerrar menú móvil al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    /* ==========================================
       3. ANIMACIÓN DE ELEMENTOS CON SCROLL REVEAL
       ========================================== */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Dejar de observar una vez revelado
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    /* ==========================================
       4. CONTADORES NUMÉRICOS ANIMADOS
       ========================================== */
    const stats = document.querySelectorAll('.stat-number');
    
    const animateCounter = (el) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const isDecimal = el.getAttribute('data-decimal') === 'true';
        const suffix = el.getAttribute('data-suffix') || '';
        let count = 0;
        const duration = 2000; // 2 segundos
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;

        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                clearInterval(timer);
                el.innerText = (isDecimal ? target.toFixed(1) : Math.round(target)) + suffix;
            } else {
                el.innerText = (isDecimal ? count.toFixed(1) : Math.round(count)) + suffix;
            }
        }, stepTime);
    };

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stats.forEach(stat => animateCounter(stat));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    /* ==========================================
       5. FILTRO INTERACTIVO DE PROPIEDADES
       ========================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const propertyCards = document.querySelectorAll('.property-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase activa de botones
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            propertyCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // Efecto de fade-out antes de ocultar
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9) translateY(10px)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'flex';
                        // Forzar reflujo
                        card.offsetHeight;
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1) translateY(0)';
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    /* ==========================================
       6. VALIDACIÓN Y ENVÍO DEL FORMULARIO DE CONTACTO
       ========================================== */
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Obtener inputs
            const nameInput = document.getElementById('formName');
            const emailInput = document.getElementById('formEmail');
            const phoneInput = document.getElementById('formPhone');
            const messageInput = document.getElementById('formMessage');
            
            // Validaciones básicas
            if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim()) {
                showFeedback('Por favor, completa todos los campos requeridos (*).', 'error');
                return;
            }

            // Cambiar estado del botón de envío
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            // Simular petición AJAX
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Feedback de éxito
                showFeedback('¡Mensaje enviado con éxito! Un asesor patrimonial de Torre Inversiones te contactará en breve.', 'success');
                contactForm.reset();
            }, 1500);
        });
    }

    const showFeedback = (message, type) => {
        formFeedback.innerText = message;
        formFeedback.className = 'form-feedback'; // reset
        formFeedback.classList.add(type);
        
        // Autocerrar el feedback después de 6 segundos en caso de éxito
        if (type === 'success') {
            setTimeout(() => {
                formFeedback.style.opacity = '0';
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                    formFeedback.style.opacity = '1';
                }, 400);
            }, 6000);
        }
    };
});

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
       5. DESARROLLOS DINÁMICOS (API)
       ------------------------------------------
       Los botones de filtro de desarrollos.html se
       generan dinámicamente a partir de los tags que
       traiga la API (ver sección 7 más abajo).
       ========================================== */
    cargarDesarrollosEnGrids();

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

/**
 * ==========================================
 * 7. DESARROLLOS DINÁMICOS DESDE LA API
 * ==========================================
 * Consume la API pública de Torre Inversiones y renderiza
 * una tarjeta por cada desarrollo recibido, tanto en el grid
 * de destacados (index.html) como en el catálogo completo
 * (desarrollos.html). Ambos usan el mismo markup [data-desarrollos-grid].
 */
const DESARROLLOS_API_URL = 'https://app.torreinversiones.com/api/desarrollos';
const DESARROLLOS_IMG_BASE = 'https://app.torreinversiones.com/';

function crearTarjetaDesarrollo(desarrollo) {
    const card = document.createElement('div');
    card.className = 'property-card';

    const tags = Array.isArray(desarrollo.tags) ? desarrollo.tags.filter(Boolean) : [];
    card.dataset.tags = tags.join('|||');

    const media = document.createElement('div');
    media.className = 'property-media';

    const img = document.createElement('img');
    img.className = 'property-img';
    img.loading = 'lazy';
    img.alt = desarrollo.nombre || 'Desarrollo Torre Inversiones';
    img.src = desarrollo.url_imagen
        ? DESARROLLOS_IMG_BASE + String(desarrollo.url_imagen).replace(/^\/+/, '')
        : 'Logo Torre Inversiones - Sin Fondo.png';
    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'property-body';

    const title = document.createElement('h3');
    title.className = 'property-title';
    title.textContent = desarrollo.nombre || 'Desarrollo';
    body.appendChild(title);

    if (tags.length > 0) {
        const tagsWrap = document.createElement('div');
        tagsWrap.className = 'property-tags';
        tags.forEach(tag => {
            const pill = document.createElement('span');
            pill.className = 'tag-pill';
            pill.textContent = tag;
            tagsWrap.appendChild(pill);
        });
        body.appendChild(tagsWrap);
    }

    const excerpt = document.createElement('p');
    excerpt.className = 'property-excerpt';
    excerpt.textContent = desarrollo.descripcion || '';
    body.appendChild(excerpt);

    if (desarrollo.link_unbroker_page) {
        const footer = document.createElement('div');
        footer.className = 'property-footer';

        const link = document.createElement('a');
        link.className = 'property-link';
        link.href = desarrollo.link_unbroker_page;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = 'Ver proyecto <i class="fas fa-arrow-right"></i>';

        footer.appendChild(link);
        body.appendChild(footer);
    }

    card.appendChild(media);
    card.appendChild(body);
    return card;
}

function mostrarEstadoGrid(grid, tipo, mensaje, icono) {
    grid.innerHTML = '';
    const state = document.createElement('div');
    state.className = `desarrollos-state desarrollos-${tipo}`;
    state.innerHTML = `<i class="fas ${icono}"></i><p>${mensaje}</p>`;
    grid.appendChild(state);
}

function aplicarFiltroDesarrollos(filterValue) {
    const grid = document.getElementById('allDesarrollosGrid');
    if (!grid) return;

    grid.querySelectorAll('.property-card').forEach(card => {
        const tags = card.dataset.tags ? card.dataset.tags.split('|||') : [];
        const visible = filterValue === 'all' || tags.includes(filterValue);
        card.style.display = visible ? '' : 'none';
    });
}

function construirFiltrosDesarrollos(desarrollos) {
    const filterContainer = document.getElementById('desarrollosFilterTabs');
    if (!filterContainer) return;

    const tagsUnicos = Array.from(new Set(
        desarrollos.flatMap(d => (Array.isArray(d.tags) ? d.tags : [])).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'es'));

    filterContainer.innerHTML = '';

    const crearBoton = (label, value, activo) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-btn' + (activo ? ' active' : '');
        btn.dataset.filter = value;
        btn.textContent = label;
        btn.addEventListener('click', () => {
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aplicarFiltroDesarrollos(value);
        });
        return btn;
    };

    filterContainer.appendChild(crearBoton('Todos', 'all', true));
    tagsUnicos.forEach(tag => filterContainer.appendChild(crearBoton(tag, tag, false)));
}

async function cargarDesarrollosEnGrids() {
    const grids = document.querySelectorAll('[data-desarrollos-grid]');
    if (grids.length === 0) return;

    grids.forEach(grid => mostrarEstadoGrid(grid, 'loading', 'Cargando desarrollos...', 'fa-spinner'));

    let desarrollos = [];
    try {
        const response = await fetch(DESARROLLOS_API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        desarrollos = (json && json.success && Array.isArray(json.data)) ? json.data : [];
    } catch (error) {
        console.error('Error al cargar desarrollos:', error);
        grids.forEach(grid => mostrarEstadoGrid(
            grid,
            'error',
            'No pudimos cargar los desarrollos en este momento. Intenta de nuevo más tarde.',
            'fa-triangle-exclamation'
        ));
        construirFiltrosDesarrollos([]);
        return;
    }

    construirFiltrosDesarrollos(desarrollos);

    grids.forEach(grid => {
        if (desarrollos.length === 0) {
            mostrarEstadoGrid(grid, 'empty', 'Próximamente nuevos desarrollos.', 'fa-building-circle-check');
            return;
        }
        grid.innerHTML = '';
        desarrollos.forEach(desarrollo => {
            grid.appendChild(crearTarjetaDesarrollo(desarrollo));
        });
    });
}

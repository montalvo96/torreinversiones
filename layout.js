/**
 * Archivo: layout.js
 * Elementos compartidos en todo el sitio:
 *   - Header con menú + botón fijo "Agenda tu asesoría"
 *   - Footer con contacto, redes, newsletter, legales y disclaimer
 *   - Botón flotante de WhatsApp con mensaje prellenado según la página
 *   - Banner de cookies (GA4 y Meta Pixel solo cargan si el visitante acepta)
 *   - Captura de UTM / fbclid y envío de TODOS los formularios a GoHighLevel
 *
 * Cada página indica en <body>:
 *   data-page="inicio|desarrollos|nosotros|partners|contacto|legal"
 *   data-wa-msg="Mensaje prellenado de WhatsApp"   (opcional)
 *   data-layout="landing"                            (landing sin menú)
 */
(function () {
    'use strict';

    const C = window.TORRE_CONFIG || {};
    const body = document.body;
    const page = body.dataset.page || '';
    const isLanding = body.dataset.layout === 'landing';
    const LOGO = 'Logo Torre Inversiones - Sin Fondo.png';      // letras blancas: para fondos oscuros (pie)
    const LOGO_DARK = 'img/logo-torre-oscuro.png';              // letras azul noche: para fondos claros (header)

    /* ---------- Utilidades públicas ---------- */
    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const waLink = (msg) => {
        if (!C.whatsapp) return null;
        const text = msg || body.dataset.waMsg || 'Hola, me gustaría recibir asesoría de Torre Inversiones.';
        return `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;
    };

    window.Torre = Object.assign(window.Torre || {}, { esc, waLink });

    /* ==========================================
       1. HEADER
       ========================================== */
    const links = [
        ['inicio', 'index.html', 'Inicio'],
        ['desarrollos', 'desarrollos.html', 'Desarrollos'],
        ['nosotros', 'nosotros.html', 'Nosotros'],
        ['partners', 'partners.html', 'Partners'],
        ['contacto', 'contacto.html', 'Contacto']
    ];

    const headerSlot = document.getElementById('site-header');
    if (headerSlot) {
        if (isLanding) {
            headerSlot.outerHTML = `
            <header class="header header-landing">
                <div class="container">
                    <nav class="navbar">
                        <span class="nav-logo"><img src="${LOGO_DARK}" alt="Torre Inversiones"></span>
                        <a href="#brochure" class="btn btn-primary nav-cta">Quiero información</a>
                    </nav>
                </div>
            </header>`;
        } else if (body.dataset.header !== 'clasico') {
            // Header editorial: barra de avisos + menú | logo al centro | acciones
            const items = links.map(([key, href, label]) =>
                `<li${key === 'inicio' ? ' class="nav-home"' : ''}><a href="${href}" class="nav-link${key === page ? ' active' : ''}">${label}</a></li>`).join('');
            const wa = waLink();
            headerSlot.outerHTML = `
            <header class="header header-editorial">
                <div class="topbar">
                    <div class="container topbar-inner">
                        <span class="topbar-side">${C.ciudad ? esc(C.ciudad) : ''}</span>
                        <span class="topbar-center">${C.telefono ? `<a href="tel:${esc(C.telefonoLink || C.telefono)}">${esc(C.telefono)}</a>` : ''}</span>
                        <span class="topbar-side topbar-right">
                            ${wa ? `<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a><span class="topbar-sep">|</span>` : ''}
                            <a href="contacto.html">Contacto</a>
                        </span>
                    </div>
                </div>
                <div class="container">
                    <nav class="navbar" aria-label="Menú principal">
                        <ul class="nav-menu" id="navMenu">
                            ${items}
                            <li class="nav-menu-cta"><a href="contacto.html#agenda" class="btn btn-primary">Agenda tu asesoría</a></li>
                        </ul>
                        <a href="index.html" class="nav-logo"><img src="${LOGO_DARK}" alt="Torre Inversiones — Inicio"></a>
                        <div class="nav-actions">
                            ${wa ? `<a href="${wa}" class="nav-icon" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>` : ''}
                            ${C.correo ? `<a href="mailto:${esc(C.correo)}" class="nav-icon" aria-label="Correo"><i class="far fa-envelope"></i></a>` : ''}
                            <a href="contacto.html#agenda" class="btn btn-primary nav-cta">Agenda tu asesoría</a>
                        </div>
                        <button class="nav-toggle" type="button" aria-label="Abrir menú" aria-controls="navMenu" aria-expanded="false">
                            <i class="fas fa-bars"></i>
                        </button>
                    </nav>
                </div>
            </header>`;
        } else {
            const items = links.map(([key, href, label]) =>
                `<li><a href="${href}" class="nav-link${key === page ? ' active' : ''}">${label}</a></li>`).join('');
            headerSlot.outerHTML = `
            <header class="header">
                <div class="container">
                    <nav class="navbar" aria-label="Menú principal">
                        <a href="index.html" class="nav-logo"><img src="${LOGO}" alt="Torre Inversiones — Inicio"></a>
                        <ul class="nav-menu" id="navMenu">
                            ${items}
                            <li class="nav-menu-cta"><a href="contacto.html#agenda" class="btn btn-primary">Agenda tu asesoría</a></li>
                        </ul>
                        <div class="nav-actions">
                            <a href="contacto.html#agenda" class="btn btn-primary nav-cta">Agenda tu asesoría</a>
                        </div>
                        <button class="nav-toggle" type="button" aria-label="Abrir menú" aria-controls="navMenu" aria-expanded="false">
                            <i class="fas fa-bars"></i>
                        </button>
                    </nav>
                </div>
            </header>`;
        }
    }

    /* ==========================================
       2. FOOTER
       ========================================== */
    const redesHtml = () => {
        const r = C.redes || {};
        const icons = { facebook: 'fa-facebook-f', instagram: 'fa-instagram', youtube: 'fa-youtube', tiktok: 'fa-tiktok', linkedin: 'fa-linkedin-in' };
        return Object.keys(icons).filter(k => r[k]).map(k =>
            `<a href="${esc(r[k])}" target="_blank" rel="noopener noreferrer" class="social-btn" aria-label="${k}"><i class="fab ${icons[k]}"></i></a>`
        ).join('');
    };

    const contactoLista = () => {
        const out = [];
        const wa = waLink();
        if (wa) out.push(`<li><i class="fab fa-whatsapp"></i><a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp ${esc(C.telefono || '')}</a></li>`);
        if (C.telefono) out.push(`<li><i class="fas fa-phone-alt"></i><a href="tel:${esc(C.telefonoLink || C.telefono)}">${esc(C.telefono)}</a></li>`);
        if (C.correo) out.push(`<li><i class="far fa-envelope"></i><a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a></li>`);
        if (C.ciudad) out.push(`<li><i class="fas fa-map-marker-alt"></i><span>${esc(C.ciudad)}</span></li>`);
        return out.join('');
    };

    const DISCLAIMER = 'La información de este sitio es de carácter informativo. Las proyecciones de plusvalía o rendimiento son estimaciones basadas en supuestos y no constituyen garantía. Toda inversión implica riesgos; te recomendamos revisar la documentación de cada proyecto antes de invertir.';

    const footerSlot = document.getElementById('site-footer');
    if (footerSlot) {
        const year = new Date().getFullYear();
        if (isLanding) {
            footerSlot.outerHTML = `
            <footer class="footer footer-landing">
                <div class="container">
                    <p class="footer-disclaimer">${DISCLAIMER}</p>
                    <div class="footer-bottom">
                        <p>&copy; ${year} Torre Inversiones.</p>
                        <div class="footer-bottom-links">
                            <a href="aviso-privacidad.html">Aviso de privacidad</a>
                            <a href="terminos.html">Términos</a>
                            <a href="disclaimer.html">Disclaimer de inversión</a>
                        </div>
                    </div>
                </div>
            </footer>`;
        } else {
            footerSlot.outerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-top">
                        <div class="footer-col footer-brand">
                            <div class="footer-logo"><img src="${LOGO}" alt="Torre Inversiones" loading="lazy"></div>
                            <p class="footer-tagline">Invierte con información, no con promesas.</p>
                            <div class="social-links">${redesHtml()}</div>
                        </div>
                        <div class="footer-col">
                            <h4 class="footer-col-title">Menú</h4>
                            <ul class="footer-links">
                                ${links.map(([, href, label]) => `<li><a href="${href}" class="footer-link">${label}</a></li>`).join('')}
                            </ul>
                        </div>
                        <div class="footer-col">
                            <h4 class="footer-col-title">Contacto</h4>
                            <ul class="footer-contact">${contactoLista()}</ul>
                        </div>
                        <div class="footer-col">
                            <h4 class="footer-col-title">Newsletter</h4>
                            <p class="newsletter-sub">Recibe preventas y reportes del mercado.</p>
                            <form class="newsletter-form" data-ghl-form data-perfil="newsletter" data-tags="newsletter" data-success="¡Listo! Te suscribiste al newsletter.">
                                <input type="email" name="correo" class="form-control" placeholder="Tu correo electrónico" required aria-label="Correo para newsletter">
                                <button type="submit" class="btn btn-primary newsletter-btn" aria-label="Suscribirse"><i class="fas fa-paper-plane"></i></button>
                                <div class="form-feedback" role="status"></div>
                            </form>
                        </div>
                    </div>
                    <p class="footer-disclaimer">${DISCLAIMER}</p>
                    <div class="footer-bottom">
                        <p>&copy; ${year} Torre Inversiones. Mérida, Yucatán.</p>
                        <div class="footer-bottom-links">
                            <a href="aviso-privacidad.html">Aviso de privacidad</a>
                            <a href="terminos.html">Términos</a>
                            <a href="disclaimer.html">Disclaimer de inversión</a>
                        </div>
                    </div>
                </div>
            </footer>`;
        }
    }

    /* ==========================================
       3. COMPORTAMIENTO DEL HEADER
       ========================================== */
    const header = document.querySelector('.header');
    if (header) {
        const onScroll = () => header.classList.toggle('header-scrolled', window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        const setOpen = (open) => {
            navMenu.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', String(open));
            const icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
            body.classList.toggle('menu-open', open);
        };
        navToggle.addEventListener('click', () => setOpen(!navMenu.classList.contains('open')));
        navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    }

    /* ==========================================
       4. WHATSAPP FLOTANTE
       ========================================== */
    const renderWaFloat = () => {
        const existing = document.querySelector('.wa-float');
        const href = waLink();
        if (!href) return;
        if (existing) { existing.href = href; return; }
        const a = document.createElement('a');
        a.className = 'wa-float';
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('aria-label', 'Escríbenos por WhatsApp');
        a.innerHTML = '<i class="fab fa-whatsapp"></i>';
        a.addEventListener('click', () => track('Contact', { method: 'whatsapp' }));
        body.appendChild(a);
    };
    renderWaFloat();
    // Las páginas pueden cambiar el mensaje (ej. ficha de desarrollo) y llamar Torre.refreshWhatsApp()
    window.Torre.refreshWhatsApp = () => {
        renderWaFloat();
        document.querySelectorAll('[data-wa]').forEach(el => {
            const href = waLink(el.dataset.wa || undefined);
            if (href) { el.href = href; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
            else el.remove();
        });
    };

    /* ==========================================
       5. UTM / FBCLID (se guardan durante la visita)
       ========================================== */
    const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'];
    const store = {
        get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
    };
    const params = new URLSearchParams(location.search);
    ATTR_KEYS.forEach(k => { const v = params.get(k); if (v) store.set('torre_' + k, v); });
    const attribution = () => {
        const out = {};
        ATTR_KEYS.forEach(k => { out[k] = params.get(k) || store.get('torre_' + k) || ''; });
        return out;
    };

    /* ==========================================
       6. COOKIES + MEDICIÓN (GA4 / META PIXEL)
       ========================================== */
    const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };

    let analyticsLoaded = false;
    const loadAnalytics = () => {
        if (analyticsLoaded) return;
        analyticsLoaded = true;
        if (C.ga4Id) {
            const s = document.createElement('script');
            s.async = true;
            s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(C.ga4Id)}`;
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', C.ga4Id);
        }
        if (C.metaPixelId) {
            /* eslint-disable */
            !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            /* eslint-enable */
            window.fbq('init', C.metaPixelId);
            window.fbq('track', 'PageView');
        }
    };

    function track(event, data) {
        if (window.fbq) window.fbq('track', event, data || {});
        if (window.gtag) window.gtag('event', event === 'Lead' ? 'generate_lead' : event.toLowerCase(), data || {});
    }
    window.Torre.track = track;

    const consent = lsGet('torre_cookies');
    if (consent === 'all') loadAnalytics();
    if (!consent) {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Aviso de cookies');
        banner.innerHTML = `
            <p>Usamos cookies necesarias para que el sitio funcione y, si lo aceptas, cookies de medición (Google Analytics y Meta) para mejorar nuestras campañas. <a href="aviso-privacidad.html">Aviso de privacidad</a>.</p>
            <div class="cookie-actions">
                <button type="button" class="btn btn-secondary" data-cookie="necessary">Solo necesarias</button>
                <button type="button" class="btn btn-primary" data-cookie="all">Aceptar</button>
            </div>`;
        banner.addEventListener('click', (e) => {
            const choice = e.target.closest('[data-cookie]');
            if (!choice) return;
            lsSet('torre_cookies', choice.dataset.cookie);
            if (choice.dataset.cookie === 'all') loadAnalytics();
            banner.remove();
        });
        body.appendChild(banner);
    }

    /* ==========================================
       7. FORMULARIOS → GOHIGHLEVEL
       ------------------------------------------
       Cualquier <form data-ghl-form> se envía al webhook de GHL.
       Atributos opcionales del form:
         data-perfil      inversionista | broker | desarrollador | newsletter | evento
         data-pipeline    Inversionistas | Brokers | Desarrolladores
         data-desarrollo  nombre del desarrollo de interés
         data-tags        tags separados por coma
         data-success     mensaje de confirmación ({nombre} se reemplaza)
       Si el form tiene un <select name="perfil">, ese valor define el pipeline.
       ========================================== */
    const PIPELINES = { inversionista: 'Inversionistas', broker: 'Brokers', desarrollador: 'Desarrolladores' };

    const showFeedback = (form, msg, type) => {
        let fb = form.querySelector('.form-feedback');
        if (!fb) { fb = document.createElement('div'); fb.className = 'form-feedback'; form.appendChild(fb); }
        fb.textContent = msg;
        fb.className = `form-feedback ${type}`;
        fb.setAttribute('role', 'status');
    };

    const buildPayload = (form) => {
        const fd = new FormData(form);
        const data = {};
        fd.forEach((v, k) => {
            if (data[k] !== undefined) data[k] = [].concat(data[k], v);
            else data[k] = typeof v === 'string' ? v.trim() : v;
        });
        const perfil = data.perfil || form.dataset.perfil || '';
        const desarrollo = data.desarrollo || form.dataset.desarrollo || '';
        const tags = (form.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        if (perfil) tags.push('perfil:' + perfil);
        if (desarrollo) tags.push('desarrollo:' + desarrollo);
        const attr = attribution();
        tags.push('fuente:' + (attr.utm_source || (attr.fbclid ? 'facebook' : 'sitio-web')));
        tags.push('pagina:' + (page || location.pathname));

        return Object.assign(data, attr, {
            perfil,
            pipeline: form.dataset.pipeline || PIPELINES[perfil] || '',
            desarrollo,
            tags: Array.from(new Set(tags)),
            pagina_origen: location.href.split('#')[0],
            enviado_en: new Date().toISOString()
        });
    };

    document.addEventListener('submit', async (e) => {
        const form = e.target.closest('form[data-ghl-form]');
        if (!form) return;
        e.preventDefault();

        if (!form.checkValidity()) { form.reportValidity(); return; }

        const payload = buildPayload(form);
        const btn = form.querySelector('[type="submit"]');
        const btnHtml = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

        try {
            if (!C.ghlWebhookUrl) {
                console.warn('[Torre] ghlWebhookUrl no está configurado en config.js. Datos del formulario:', payload);
                throw new Error('webhook-no-configurado');
            }
            const res = await fetch(C.ghlWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);

            track('Lead', { content_name: payload.desarrollo || payload.perfil || 'formulario' });
            const nombre = (payload.nombre || '').split(' ')[0];
            const tpl = form.dataset.success || (nombre
                ? 'Gracias, {nombre}. Recibimos tu mensaje y te contactaremos por WhatsApp muy pronto.'
                : 'Gracias. Recibimos tu mensaje y te contactaremos por WhatsApp muy pronto.');
            showFeedback(form, tpl.replace('{nombre}', nombre), 'success');
            form.reset();
            form.dispatchEvent(new CustomEvent('torre:lead', { detail: payload }));
        } catch (err) {
            const wa = waLink();
            showFeedback(form,
                err.message === 'webhook-no-configurado'
                    ? 'El formulario todavía no está conectado. Por favor escríbenos por WhatsApp mientras tanto.'
                    : 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp.',
                'error');
            if (wa) {
                const fb = form.querySelector('.form-feedback');
                fb.insertAdjacentHTML('beforeend', ` <a href="${wa}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>`);
            }
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
        }
    });

    /* ==========================================
       8. SCROLL REVEAL
       ========================================== */
    const observeReveal = (root) => {
        const els = (root || document).querySelectorAll('.reveal:not(.active)');
        if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('active')); return; }
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('active'); o.unobserve(en.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        els.forEach(el => obs.observe(el));
    };
    window.Torre.observeReveal = observeReveal;

    window.Torre.refreshWhatsApp();
    observeReveal();
})();

/* ==========================================
   MOVIMIENTO ORGÁNICO
   Animaciones suaves que nunca tapan contenido:
   - Luces doradas que respiran detrás de los héroes (debajo del texto, sin clics).
   - Tarjetas y listas que entran escalonadas.
   - Fotos que "se abren" al aparecer (sin salirse de su caja).
   - Cifras de la barra de confianza que cuentan hasta su valor.
   Todo se desactiva si el visitante pide menos movimiento.
   ========================================== */
(function () {
    'use strict';
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('motion-ok');

    const HEROES = '.hero-home, .internal-hero, .ficha-hero, .cta-final';
    const GRIDS = '.properties-grid, .cards-2, .cards-4, .steps-grid, .audience-grid, .benefits-grid, .partners-grid, .trust-grid, .testimonials-grid, .check-list, .risk-list, .legal-checklist, .ficha-summary';
    const PHOTOS = '.media-split-photo.has-img, .gallery-item';

    const show = (el) => {
        if (el.classList.contains('in')) return;
        el.classList.add('in');
        if (el.classList.contains('trust-number')) countUp(el);
    };
    const pending = new Set();
    const ioCore = new IntersectionObserver((entries, o) => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            show(en.target); pending.delete(en.target); o.unobserve(en.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    const io = { observe: (el) => { pending.add(el); ioCore.observe(el); } };

    // Respaldo: si el navegador retrasa el IntersectionObserver (pestaña en segundo plano,
    // saltos con anclas), revisamos la posición al hacer scroll para que nada quede invisible.
    // También cubre los .reveal del sitio.
    let checking = false;
    const sweep = () => {
        checking = false;
        const limit = window.innerHeight * 0.95;
        pending.forEach(el => {
            if (!el.isConnected) { pending.delete(el); return; }
            if (el.getBoundingClientRect().top < limit) { show(el); pending.delete(el); ioCore.unobserve(el); }
        });
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            if (el.getBoundingClientRect().top < limit) el.classList.add('active');
        });
    };
    const queueSweep = () => { if (!checking) { checking = true; setTimeout(sweep, 120); } };
    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep);
    window.addEventListener('load', queueSweep);

    // Luces ambientales: 3 manchas difusas por héroe, cada una con su propio ritmo
    const ambient = (sec) => {
        if (sec.dataset.ambient) return;
        sec.dataset.ambient = '1';
        sec.classList.add('has-ambient');
        const wrap = document.createElement('div');
        wrap.className = 'ambient';
        wrap.setAttribute('aria-hidden', 'true');
        wrap.innerHTML = '<span></span><span></span><span></span>';
        sec.prepend(wrap);
    };

    // Entrada escalonada de los hijos de cada grid/lista
    const stagger = (grid) => {
        [...grid.children].forEach((child, i) => {
            if (child.dataset.motion || child.classList.contains('ambient')) return;
            child.dataset.motion = '1';
            child.classList.add('m-rise');
            child.style.setProperty('--m-i', Math.min(i, 8));
            io.observe(child);
        });
    };

    const photo = (el) => {
        if (el.dataset.motion) return;
        el.dataset.motion = '1';
        el.classList.add('m-open');
        io.observe(el);
    };

    // Conteo de cifras: respeta prefijos/sufijos ("450+", "8", "$1.2M")
    const countUp = (el) => {
        const raw = el.textContent.trim();
        const m = raw.match(/^(\D*)([\d.,]+)(.*)$/);
        if (!m) return;
        const target = parseFloat(m[2].replace(/,/g, ''));
        if (!isFinite(target) || target <= 0) return;
        const dec = (m[2].split('.')[1] || '').length;
        const dur = 1600, t0 = performance.now();
        const fmt = (v) => m[1] + v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + m[3];
        el.style.minWidth = el.offsetWidth + 'px';      // evita que el texto brinque al contar
        const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const e = 1 - Math.pow(1 - p, 4);           // desacelera al final, como al asentarse
            el.textContent = fmt(target * e);
            if (p < 1) requestAnimationFrame(tick); else el.textContent = raw;
        };

        requestAnimationFrame(tick);
    };

    const scan = (root) => {
        root.querySelectorAll(HEROES).forEach(ambient);
        root.querySelectorAll(GRIDS).forEach(stagger);
        root.querySelectorAll(PHOTOS).forEach(photo);
        root.querySelectorAll('.trust-number:not([data-motion])').forEach(el => { el.dataset.motion = '1'; io.observe(el); });
    };

    // El contenido de fichas, catálogo y cifras se pinta después; lo detectamos al llegar
    let scanQueued = false;
    const mo = new MutationObserver(() => {
        if (scanQueued) return;
        scanQueued = true;
        setTimeout(() => { scanQueued = false; scan(document); queueSweep(); }, 60);
    });
    const start = () => { scan(document); mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

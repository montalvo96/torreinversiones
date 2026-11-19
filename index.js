/**
 * Archivo: index.js
 * Contenido dinámico del sitio Torre Inversiones:
 *   - Catálogo de desarrollos con filtros (ubicación, tipo, ticket, etapa)
 *   - Desarrollos destacados en Inicio
 *   - Ficha individual (/desarrollos/<slug> o desarrollo.html?d=<slug>)
 *   - Landing por desarrollo sin menú (/landing/<slug> o landing.html?d=<slug>)
 *   - Bloques que dependen de datos reales de config.js (cifras, testimonios,
 *     eventos, aliados, contacto, calendario). Si no hay dato, el bloque se oculta.
 *
 * Requiere: config.js, desarrollos-data.js y layout.js cargados antes.
 */
(function () {
    'use strict';

    const C = window.TORRE_CONFIG || {};
    const T = window.Torre || {};
    const esc = T.esc;
    const $ = (sel, root) => (root || document).querySelector(sel);

    /* ==========================================
       CATÁLOGOS DE FILTROS
       ========================================== */
    const ZONAS = { 'merida': 'Mérida', 'riviera-maya': 'Riviera Maya / Puerto Morelos' };
    const TIPOS = { 'lote': 'Lote', 'departamento': 'Departamento', 'casa': 'Casa', 'agroinversion': 'Agroinversión' };
    const ETAPAS = { 'preventa': 'Preventa', 'construccion': 'En construcción', 'entrega-inmediata': 'Entrega inmediata' };
    const TICKETS = [
        { id: 'hasta-500k', label: 'Hasta $500 mil', min: 0, max: 500000 },
        { id: '500k-1m', label: '$500 mil – $1 millón', min: 500000, max: 1000000 },
        { id: '1m-3m', label: '$1 – $3 millones', min: 1000000, max: 3000000 },
        { id: 'mas-3m', label: 'Más de $3 millones', min: 3000000, max: Infinity }
    ];
    const POR_CONFIRMAR = '<span class="pending">Por confirmar</span>';

    const money = (n) => (n == null || isNaN(n)) ? null
        : '$' + Number(n).toLocaleString('es-MX', { maximumFractionDigits: 0 }) + ' MXN';

    const fichaUrl = (slug) => location.protocol === 'file:'
        ? `desarrollo.html?d=${encodeURIComponent(slug)}`
        : `/desarrollos/${encodeURIComponent(slug)}`;

    const currentSlug = (prefix) => {
        const q = new URLSearchParams(location.search).get('d');
        if (q) return q;
        const m = location.pathname.match(new RegExp('/' + prefix + '/([^/?#]+)'));
        return m ? decodeURIComponent(m[1]) : null;
    };

    const placeholder = (label, icon) =>
        `<div class="ph"><i class="fas ${icon || 'fa-image'}"></i><span>${esc(label)}</span></div>`;

    /* ==========================================
       DATOS: local (desarrollos-data.js) + API/CMS
       ========================================== */
    // Lee el primer campo existente entre varios nombres posibles (es/en, snake/camel)
    const pick = (o, ...keys) => {
        if (!o || typeof o !== 'object') return null;
        for (const k of keys) {
            const v = k.split('.').reduce((a, p) => (a == null ? a : a[p]), o);
            if (v != null && v !== '' && !(Array.isArray(v) && v.length === 0)) return v;
        }
        return null;
    };
    const sinAcentos = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const slugify = (s) => sinAcentos(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const absUrl = (u) => {
        if (u && typeof u === 'object') u = u.url || u.src || u.path || null;
        if (!u || typeof u !== 'string') return null;
        return /^(https?:)?\/\//.test(u) ? u : (C.proyectosImgBase || '') + u.replace(/^\/+/, '');
    };
    const arr = (v) => Array.isArray(v) ? v
        : (typeof v === 'string' && v.trim() ? v.split(/\r?\n|;/).map(x => x.trim()).filter(Boolean) : []);
    const textos = (v) => arr(v).map(x => typeof x === 'string' ? x
        : (x && (x.texto || x.text || x.descripcion || x.nombre)) || '').filter(Boolean);

    // Convierte valores libres del CMS a las claves de los filtros ("En construcción" -> "construccion")
    const normTipo = (v) => {
        if (!v) return null;
        const s = sinAcentos(v);
        if (/agro|citric|coco|cultivo/.test(s)) return 'agroinversion';
        if (/lote|terreno/.test(s)) return 'lote';
        if (/depa|condo|loft/.test(s)) return 'departamento';
        if (/casa|villa|residencia|townhouse/.test(s)) return 'casa';
        return slugify(v);
    };
    const normEtapa = (v) => {
        if (!v) return null;
        const s = sinAcentos(v);
        if (/pre ?-?venta/.test(s)) return 'preventa';
        if (/constru|obra/.test(s)) return 'construccion';
        if (/inmediat|entregad|terminad|listo/.test(s)) return 'entrega-inmediata';
        return slugify(v);
    };
    const normZona = (zona, ubicacion) => {
        const s = sinAcentos(zona || ubicacion || '');
        if (!s) return null;
        if (/merida|yucatan/.test(s)) return 'merida';
        if (/riviera|puerto morelos|playa del carmen|tulum|cancun|quintana roo|bacalar/.test(s)) return 'riviera-maya';
        return zona ? slugify(zona) : null;
    };
    const precioNum = (v) => {
        if (v == null || v === '') return null;
        const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.]/g, ''));
        return isNaN(n) || n === 0 ? null : n;
    };

    // "2027-12-01" -> "diciembre 2027"; cualquier otro texto se deja igual
    const fechaLegible = (v) => {
        if (!v || typeof v !== 'string' || !/^\d{4}-\d{2}/.test(v)) return v || null;
        const [y, m] = v.split('-').map(Number);
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return meses[m - 1] ? `${meses[m - 1]} ${y}` : v;
    };

    // Normaliza un proyecto de la API de Space Broker (tolerante a nombres de campo distintos)
    const normalizarApi = (d) => {
        const nombre = pick(d, 'nombre', 'name', 'titulo', 'title') || 'Proyecto';
        const id = pick(d, 'id', 'uuid');
        // Space Broker guarda ciudad y estado por separado
        const ciudadEstado = [pick(d, 'ciudad'), pick(d, 'estado_ubicacion')].filter(Boolean).join(', ');
        const ubicacion = pick(d, 'ubicacion', 'location') || ciudadEstado || pick(d, 'direccion', 'address');
        const coords = (d.latitud != null && d.longitud != null) ? `${d.latitud},${d.longitud}` : null;
        const estatus = sinAcentos(pick(d, 'estatus', 'status', 'estado') || '');
        const publicado = pick(d, 'publicado', 'published', 'activo', 'active', 'visible');
        const galeria = arr(pick(d, 'imagenes', 'images', 'galeria', 'gallery', 'media_proyectos', 'media'))
            .map(m => absUrl(m && typeof m === 'object' ? (m.url_imagen || m.url || m.src) : m)).filter(Boolean);
        const tip = arr(pick(d, 'tipologias', 'producto.tipologias', 'unidades', 'units'));
        const escR = pick(d, 'escenarios', 'escenarios_rendimiento', 'scenarios');
        const filas = arr(pick(escR, 'filas', 'rows'));
        const dev = pick(d, 'desarrollador', 'developer');
        return {
            id,
            slug: pick(d, 'slug') || slugify(nombre) || String(id),
            nombre,
            activo: !(publicado === false || publicado === 0 || publicado === '0' || /pausad|inactiv|borrador|draft|archiv/.test(estatus)),
            destacado: !!pick(d, 'destacado', 'featured'),
            ubicacion,
            zona: normZona(pick(d, 'zona', 'region'), ubicacion),
            tipo: normTipo(pick(d, 'tipo', 'tipo_desarrollo', 'type', 'categoria', 'tipo_proyecto')),
            etapa: normEtapa(pick(d, 'etapa', 'estado_construccion', 'stage', 'fase')),
            precioDesde: precioNum(pick(d, 'precio_desde', 'precioDesde', 'precio', 'price_from', 'price')),
            entrega: fechaLegible(pick(d, 'entrega', 'entrega_estimada', 'fecha_entrega', 'delivery')),
            resumen: pick(d, 'resumen', 'descripcion_corta', 'descripcion', 'description'),
            tags: arr(pick(d, 'tags', 'etiquetas')).map(t => typeof t === 'string' ? t : (t && t.nombre) || '').filter(Boolean),
            portada: absUrl(pick(d, 'portada', 'imagen', 'url_imagen', 'cover', 'image')) || galeria[0] || null,
            galeria,
            video: pick(d, 'video', 'video_url', 'youtube'),
            porQueNosGusta: textos(pick(d, 'por_que_nos_gusta', 'porQueNosGusta', 'ventajas', 'beneficios', 'highlights')),
            loQueDebesSaber: textos(pick(d, 'lo_que_debes_saber', 'loQueDebesSaber', 'riesgos', 'consideraciones', 'risks')),
            desarrollador: !dev ? null : (typeof dev === 'string'
                ? { nombre: dev, trayectoria: pick(d, 'trayectoria_desarrollador') }
                : { nombre: pick(dev, 'nombre', 'name'), trayectoria: pick(dev, 'trayectoria', 'descripcion', 'bio') }),
            mapa: {
                query: pick(d, 'mapa.query', 'mapa_query', 'coordenadas') || coords || pick(d, 'direccion') || ubicacion,
                puntosDeInteres: textos(pick(d, 'puntos_de_interes', 'mapa.puntosDeInteres', 'amenidades_cercanas', 'amenidades'))
            },
            producto: {
                tipologias: tip.map(t => ({
                    nombre: pick(t, 'nombre', 'name', 'tipo') || '—',
                    superficie: pick(t, 'superficie', 'm2', 'area'),
                    precio: precioNum(pick(t, 'precio', 'price')) ?? pick(t, 'precio')
                })),
                esquemasPago: textos(pick(d, 'esquemas_pago', 'esquemasPago', 'formas_pago', 'payment_plans'))
            },
            legal: arr(pick(d, 'legal', 'documentos', 'documentos_legales', 'legal_checklist')).map(l => typeof l === 'string'
                ? { documento: l, verificado: null }
                : { documento: pick(l, 'documento', 'nombre', 'name') || '—', verificado: l.verificado ?? l.verified ?? null }),
            escenarios: filas.length ? {
                supuestos: textos(pick(escR, 'supuestos', 'assumptions')),
                filas: filas.map(f => ({ escenario: pick(f, 'escenario', 'nombre', 'name'), valor: pick(f, 'valor', 'value') }))
            } : null,
            brochure: absUrl(pick(d, 'brochure', 'brochure_url', 'pdf')),
            linkExterno: pick(d, 'link_publico', 'url_publica', 'link_unbroker_page', 'link_proyecto', 'url')
        };
    };

    // Acepta: [..], {data:[..]}, {proyectos:[..]}, {data:{data:[..]}} (paginado), etc.
    const extraerLista = (json) => {
        if (Array.isArray(json)) return json;
        if (!json || typeof json !== 'object') return [];
        for (const k of ['data', 'proyectos', 'projects', 'items', 'results']) {
            if (Array.isArray(json[k])) return json[k];
            if (json[k] && Array.isArray(json[k].data)) return json[k].data;
        }
        return [];
    };

    const esVacio = (v) => v == null || (Array.isArray(v) && !v.length) ||
        (typeof v === 'object' && !Array.isArray(v) && Object.values(v).every(x => x == null || (Array.isArray(x) && !x.length)));

    let cache = null;
    const cargarDesarrollos = async () => {
        if (cache) return cache;
        const locales = (window.TORRE_DESARROLLOS || []).map(d => Object.assign({}, d));
        let lista = locales;

        if (C.proyectosApiUrl) {
            try {
                const res = await fetch(C.proyectosApiUrl, { headers: { Accept: 'application/json' } });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const api = extraerLista(await res.json()).filter(Boolean).map(normalizarApi);
                const porSlug = new Map(locales.map(d => [d.slug, d]));
                // La API manda: solo se muestran los proyectos que regrese. Lo local rellena huecos.
                lista = api.map(p => {
                    const local = porSlug.get(p.slug);
                    if (!local) return p;
                    const out = Object.assign({}, local);
                    Object.keys(p).forEach(k => { if (!esVacio(p[k])) out[k] = p[k]; });
                    return out;
                });
            } catch (err) {
                console.warn('[Torre] No se pudo consultar la API de Space Broker; se usan los datos locales.', err);
            }
        }
        cache = lista.filter(d => d.activo !== false);
        return cache;
    };

    /* ==========================================
       TARJETA DE DESARROLLO
       ========================================== */
    // Etiqueta legible para valores que no están en los catálogos ("casa-de-playa" -> "Casa de playa")
    const etiqueta = (map, v) => map[v] || (v ? (v.charAt(0).toUpperCase() + v.slice(1)).replace(/-/g, ' ') : '');

    const tarjeta = (d) => {
        const precio = money(d.precioDesde);
        const chips = [d.tipo ? etiqueta(TIPOS, d.tipo) : null]
            .concat((d.tags || []).slice(0, 3))
            .filter((x, i, a) => x && a.findIndex(y => y && sinAcentos(y) === sinAcentos(x)) === i);
        const resumen = d.resumen ? d.resumen.replace(/\[[^\]]*\]/g, '').trim() : '';
        return `
        <article class="property-card">
            <a class="property-media" href="${fichaUrl(d.slug)}" aria-label="Ver ${esc(d.nombre)}">
                ${d.portada
                    ? `<img class="property-img" src="${esc(d.portada)}" alt="${esc(d.nombre)}" loading="lazy" decoding="async">`
                    : placeholder('[Foto del desarrollo]', 'fa-building')}
                ${d.etapa ? `<span class="property-badge">${esc(etiqueta(ETAPAS, d.etapa))}</span>` : ''}
                <span class="property-price-chip">${precio ? `Desde ${esc(precio)}` : 'Precio por confirmar'}</span>
            </a>
            <div class="property-body">
                <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${d.ubicacion ? esc(d.ubicacion) : 'Ubicación por confirmar'}</p>
                <h3 class="property-title"><a href="${fichaUrl(d.slug)}">${esc(d.nombre)}</a></h3>
                ${resumen ? `<p class="property-excerpt">${esc(resumen)}</p>` : ''}
                ${chips.length ? `<div class="property-tags">${chips.map(c => `<span class="tag-pill">${esc(c)}</span>`).join('')}</div>` : ''}
                <a class="property-link" href="${fichaUrl(d.slug)}">Ver proyecto <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>`;
    };

    const estado = (grid, tipo, msg, icon) => {
        grid.innerHTML = `<div class="desarrollos-state desarrollos-${tipo}"><i class="fas ${icon}"></i><p>${msg}</p></div>`;
    };

    /* ==========================================
       INICIO: DESTACADOS
       ========================================== */
    const initDestacados = async () => {
        const grid = $('#featuredGrid');
        if (!grid) return;
        estado(grid, 'loading', 'Cargando desarrollos...', 'fa-spinner');
        const lista = await cargarDesarrollos();
        const destacados = lista.filter(d => d.destacado).slice(0, 3);
        const mostrar = destacados.length ? destacados : lista.slice(0, 3);
        if (!mostrar.length) { estado(grid, 'empty', 'Próximamente nuevos desarrollos.', 'fa-building'); return; }
        grid.innerHTML = mostrar.map(tarjeta).join('');
    };

    /* ==========================================
       CATÁLOGO CON FILTROS
       ========================================== */
    const initCatalogo = async () => {
        const grid = $('#catalogGrid');
        const form = $('#catalogFilters');
        if (!grid || !form) return;

        TICKETS.forEach(t => form.elements.ticket.insertAdjacentHTML('beforeend', `<option value="${t.id}">${esc(t.label)}</option>`));

        estado(grid, 'loading', 'Cargando desarrollos...', 'fa-spinner');
        const lista = await cargarDesarrollos();

        // Opciones orgánicas: catálogo base + cualquier valor nuevo que llegue desde Space Broker
        const fill = (name, map) => {
            const sel = form.elements[name];
            const valores = Object.keys(map).concat(lista.map(d => d[name]).filter(v => v && !map[v]));
            Array.from(new Set(valores)).forEach(k =>
                sel.insertAdjacentHTML('beforeend', `<option value="${esc(k)}">${esc(etiqueta(map, k))}</option>`));
        };
        fill('zona', ZONAS);
        fill('tipo', TIPOS);
        fill('etapa', ETAPAS);

        const render = () => {
            const f = Object.fromEntries(new FormData(form));
            const ticket = TICKETS.find(t => t.id === f.ticket);
            const res = lista.filter(d =>
                (!f.zona || d.zona === f.zona) &&
                (!f.tipo || d.tipo === f.tipo) &&
                (!f.etapa || d.etapa === f.etapa) &&
                (!ticket || (d.precioDesde != null && d.precioDesde >= ticket.min && d.precioDesde < ticket.max))
            );
            const count = $('#catalogCount');
            if (count) count.textContent = `${res.length} ${res.length === 1 ? 'desarrollo' : 'desarrollos'}`;
            if (!res.length) {
                estado(grid, 'empty', 'No hay desarrollos con esos filtros. Prueba con otra combinación o <a href="contacto.html">cuéntanos qué buscas</a>.', 'fa-filter');
                return;
            }
            grid.innerHTML = res.map(tarjeta).join('');
        };

        form.addEventListener('change', render);
        form.addEventListener('reset', () => setTimeout(render, 0));
        render();
    };

    /* ==========================================
       FICHA INDIVIDUAL (y landing)
       ========================================== */
    const embedVideo = (url) => {
        if (!url) return '';
        let src = url;
        const yt = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
        if (yt) src = `https://www.youtube-nocookie.com/embed/${yt[1]}`;
        const vm = url.match(/vimeo\.com\/(\d+)/);
        if (vm) src = `https://player.vimeo.com/video/${vm[1]}`;
        return `<div class="video-embed"><iframe src="${esc(src)}" title="Video del desarrollo" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    };

    /* Fotos de eventos: versión ligera (900px) para mosaicos y cinta; original (2400px) para pantallas grandes y visor */
    const miniatura = (src) => String(src).replace('img/eventos/', 'img/eventos/thumb/');
    const fotoResponsive = (src, alt, sizes) => /img\/eventos\//.test(src)
        ? `<img src="${esc(miniatura(src))}" srcset="${esc(miniatura(src))} 900w, ${esc(String(src).replace('img/eventos/', 'img/eventos/md/'))} 1600w, ${esc(src)} 2400w" sizes="${sizes}" data-full="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`
        : `<img src="${esc(src)}" data-full="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;

    const galeriaEventos = (ev) => ev.map(e => {
        const cap = [e.ciudad, e.fecha].filter(Boolean).join(' · ');
        return `
            <figure class="gallery-item">
                ${fotoResponsive(e.src, e.alt || 'Evento de Torre Inversiones', '(min-width: 768px) 50vw, 100vw')}
                ${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}
            </figure>`;
    }).join('');

    const lista = (arr) => `<ul class="check-list">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;

    const brochureForm = (d, opts) => `
        <form class="contact-form brochure-form" data-ghl-form data-perfil="inversionista" data-desarrollo="${esc(d.nombre)}"
              data-tags="brochure${opts && opts.landing ? ',landing' : ''}"
              data-success="Gracias, {nombre}. ${d.brochure ? 'Tu brochure se abrió en una pestaña nueva; ' : 'Te enviaremos el brochure y '}te contactaremos por WhatsApp muy pronto.">
            <input type="hidden" name="interes" value="${d.tipo === 'agroinversion' ? 'agroinversion' : 'inmobiliario'}">
            <div class="form-group">
                <label for="bName">Nombre *</label>
                <input type="text" id="bName" name="nombre" class="form-control" autocomplete="name" required>
            </div>
            <div class="form-group">
                <label for="bPhone">WhatsApp *</label>
                <input type="tel" id="bPhone" name="telefono" class="form-control" autocomplete="tel" inputmode="tel" required>
            </div>
            <div class="form-group">
                <label for="bEmail">Correo *</label>
                <input type="email" id="bEmail" name="correo" class="form-control" autocomplete="email" required>
            </div>
            <label class="checkbox-row">
                <input type="checkbox" name="acepta_privacidad" value="si" required>
                <span>Acepto el <a href="aviso-privacidad.html" target="_blank">aviso de privacidad</a>.</span>
            </label>
            <button type="submit" class="btn btn-primary submit-btn">Descargar brochure <i class="fas fa-file-download"></i></button>
            <div class="form-feedback" role="status"></div>
        </form>`;

    const renderFicha = (d, opts) => {
        const landing = opts && opts.landing;
        const waMsg = `Hola, me interesa información de ${d.nombre}`;
        document.body.dataset.waMsg = waMsg;
        document.title = `${d.nombre} | Torre Inversiones`;
        const metaDesc = $('meta[name="description"]');
        if (metaDesc && d.resumen) metaDesc.setAttribute('content', d.resumen.replace(/\[[^\]]*\]/g, '').trim());

        const precio = money(d.precioDesde);
        const galeria = (d.galeria && d.galeria.length) ? d.galeria : (d.portada ? [d.portada] : []);
        const gal = galeria.length
            ? `<div class="ficha-gallery">${galeria.map((src, i) =>
                `<img src="${esc(src)}" alt="${esc(d.nombre)} — imagen ${i + 1}" loading="${i ? 'lazy' : 'eager'}" decoding="async">`).join('')}</div>`
            : `<div class="ficha-gallery">${placeholder('[Renders, avances de obra y fotos del desarrollo]', 'fa-images')}</div>`;

        const dev = d.desarrollador || {};
        const mapa = d.mapa || {};
        const prod = d.producto || {};
        const tip = prod.tipologias || [];
        const pagos = prod.esquemasPago || [];
        const legal = d.legal || [];
        const esc_ = d.escenarios;

        const secciones = [];

        secciones.push(`
            <section class="ficha-section" id="por-que">
                <h2 class="title-small">Por qué nos gusta este proyecto</h2>
                ${(d.porQueNosGusta && d.porQueNosGusta.length) ? lista(d.porQueNosGusta) : `<p>${POR_CONFIRMAR}</p>`}
            </section>`);

        // Bloque sello de Torre: nunca se omite
        secciones.push(`
            <section class="ficha-section risk-box" id="lo-que-debes-saber">
                <h2 class="title-small"><i class="fas fa-exclamation-circle"></i> Lo que debes saber</h2>
                <p>Ninguna inversión está libre de riesgo. Estos son los puntos que nosotros revisaríamos con calma antes de invertir en este proyecto:</p>
                ${(d.loQueDebesSaber && d.loQueDebesSaber.length) ? `<ul class="risk-list">${d.loQueDebesSaber.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${POR_CONFIRMAR}</p>`}
                <p>Si tienes dudas sobre cualquiera, te las respondemos con documentos.</p>
            </section>`);

        if (!landing) {
            secciones.push(`
            <section class="ficha-section" id="desarrollador">
                <h2 class="title-small">El desarrollador</h2>
                <h3 class="dev-name">${dev.nombre ? esc(dev.nombre) : POR_CONFIRMAR}</h3>
                <p>${dev.trayectoria ? esc(dev.trayectoria) : 'Trayectoria comprobable: <span class="pending">por confirmar</span>.'}</p>
            </section>`);
        }

        secciones.push(`
            <section class="ficha-section" id="ubicacion">
                <h2 class="title-small">Ubicación</h2>
                ${mapa.query
                    ? `<div class="map-embed"><iframe title="Mapa de ${esc(d.nombre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                          src="https://www.google.com/maps?q=${encodeURIComponent(mapa.query)}&output=embed"></iframe></div>`
                    : placeholder('[Mapa: ubicación por confirmar]', 'fa-map-marked-alt')}
                ${(mapa.puntosDeInteres && mapa.puntosDeInteres.length) ? `<h3 class="subhead">Puntos de interés cercanos</h3>${lista(mapa.puntosDeInteres)}` : ''}
            </section>`);

        secciones.push(`
            <section class="ficha-section" id="producto">
                <h2 class="title-small">Producto y precios</h2>
                ${tip.length ? `
                <div class="table-wrap"><table class="price-table">
                    <thead><tr><th>Tipología</th><th>Superficie</th><th>Precio</th></tr></thead>
                    <tbody>${tip.map(t => `<tr><td>${esc(t.nombre)}</td><td>${esc(t.superficie || '—')}</td><td>${esc(typeof t.precio === 'number' ? money(t.precio) : (t.precio || '—'))}</td></tr>`).join('')}</tbody>
                </table></div>` : `<p>Tipologías, superficies y precios: ${POR_CONFIRMAR}</p>`}
                ${pagos.length ? `<h3 class="subhead">Esquemas de pago</h3>${lista(pagos)}` : ''}
            </section>`);

        if (!landing) {
            secciones.push(`
            <section class="ficha-section" id="legal">
                <h2 class="title-small">Estatus legal revisado</h2>
                <ul class="legal-checklist">
                    ${legal.map(l => {
                        const st = l.verificado === true ? ['ok', 'fa-check-circle', 'Verificado']
                            : l.verificado === false ? ['no', 'fa-times-circle', 'Pendiente']
                            : ['wait', 'fa-hourglass-half', 'Por confirmar'];
                        return `<li class="legal-${st[0]}"><i class="fas ${st[1]}"></i><span>${esc(l.documento)}</span><em>${st[2]}</em></li>`;
                    }).join('')}
                </ul>
                <p class="fine">¿Quieres ver los documentos? Pídelos y te los compartimos.</p>
            </section>`);
        }

        if (esc_ && esc_.filas && esc_.filas.length) {
            secciones.push(`
            <section class="ficha-section" id="escenarios">
                <h2 class="title-small">Escenarios de rendimiento</h2>
                <div class="table-wrap"><table class="price-table">
                    <thead><tr><th>Escenario</th><th>Estimación</th></tr></thead>
                    <tbody>${esc_.filas.map(f => `<tr><td>${esc(f.escenario)}</td><td>${esc(f.valor)}</td></tr>`).join('')}</tbody>
                </table></div>
                ${esc_.supuestos && esc_.supuestos.length ? `<h3 class="subhead">Supuestos</h3>${lista(esc_.supuestos)}` : ''}
                <p class="fine">Estas cifras son estimaciones basadas en los supuestos indicados y no constituyen garantía de rendimiento. Toda inversión implica riesgos.</p>
            </section>`);
        }

        const datos = [
            ['fa-map-marker-alt', 'Ubicación', d.ubicacion],
            ['fa-layer-group', 'Tipo', d.tipo ? etiqueta(TIPOS, d.tipo) : null],
            ['fa-tag', 'Desde', precio],
            ['fa-calendar-check', 'Entrega estimada', d.entrega]
        ];

        return `
        <section class="ficha-hero">
            <div class="container">
                ${landing ? '' : `<a class="back-link" href="desarrollos.html"><i class="fas fa-arrow-left"></i> Todos los desarrollos</a>`}
                <span class="eyebrow">${d.etapa ? esc(etiqueta(ETAPAS, d.etapa)) : 'Desarrollo revisado por Torre'}</span>
                <h1 class="title-large">${esc(d.nombre)}</h1>
                ${d.resumen ? `<p class="ficha-lead">${esc(d.resumen)}</p>` : ''}
                ${gal}
                ${d.video ? embedVideo(d.video) : ''}
                <dl class="ficha-summary">
                    ${datos.map(([icon, label, val]) => `
                    <div><dt><i class="fas ${icon}"></i> ${label}</dt><dd>${val ? esc(val) : POR_CONFIRMAR}</dd></div>`).join('')}
                </dl>
            </div>
        </section>
        <div class="container ficha-layout">
            <div class="ficha-main">${secciones.join('')}</div>
            <aside class="ficha-aside" id="brochure">
                <div class="aside-card">
                    <h2 class="title-small">Descarga el brochure</h2>
                    <p>Te enviamos el detalle completo de ${esc(d.nombre)}.</p>
                    ${brochureForm(d, opts)}
                    <a class="btn btn-whatsapp" data-wa="${esc(waMsg)}" href="#"><i class="fab fa-whatsapp"></i> Pregunta por WhatsApp</a>
                    ${d.linkExterno ? `<a class="btn-link aside-ext" href="${esc(d.linkExterno)}" target="_blank" rel="noopener noreferrer">Ver presentación completa del proyecto <i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            </aside>
        </div>
        ${(C.eventos || []).length ? `
        <section class="section-padding section-alt landing-eventos" id="eventos">
            <div class="container">
                <div class="section-header">
                    <span class="eyebrow">Nuestros eventos</span>
                    <h2 class="title-medium">Hablamos de inversión de frente.</h2>
                    <p>Presentamos cada proyecto en persona, con datos reales, ante inversionistas y asesores.</p>
                </div>
                <div class="gallery-grid gallery-mosaic">${galeriaEventos(C.eventos)}</div>
            </div>
        </section>` : ''}
        ${landing ? '' : `
        <section class="broker-band">
            <div class="container">
                <div>
                    <h2 class="title-small">¿Eres asesor?</h2>
                    <p>Comercializa este desarrollo con nosotros.</p>
                </div>
                <a href="partners.html#brokers" class="btn btn-secondary">Quiero ser broker aliado <i class="fas fa-arrow-right"></i></a>
            </div>
        </section>`}`;
    };

    const initFicha = async (rootSel, prefix, opts) => {
        const root = $(rootSel);
        if (!root) return;
        const slug = currentSlug(prefix);
        estado(root, 'loading', 'Cargando desarrollo...', 'fa-spinner');
        const lista = await cargarDesarrollos();
        const d = lista.find(x => x.slug === slug);
        if (!d) {
            root.innerHTML = `
            <section class="internal-hero"><div class="container">
                <h1 class="internal-hero-title text-gradient-gold">Desarrollo no encontrado</h1>
                <p class="internal-hero-subtitle">Es posible que este proyecto ya no esté disponible.</p>
                <p style="margin-top:2rem"><a class="btn btn-primary" href="desarrollos.html">Ver desarrollos</a></p>
            </div></section>`;
            return;
        }
        root.innerHTML = renderFicha(d, opts);
        root.addEventListener('torre:lead', () => { if (d.brochure) window.open(d.brochure, '_blank', 'noopener'); });
        if (T.refreshWhatsApp) T.refreshWhatsApp();
    };

    /* ==========================================
       BLOQUES QUE DEPENDEN DE DATOS REALES
       ========================================== */
    const initCifras = () => {
        const el = $('#trustBar');
        if (!el) return;
        const cifras = (C.cifras || []).filter(c => c.valor != null && c.valor !== '');
        if (!cifras.length) { el.remove(); return; }
        $('.trust-grid', el).innerHTML = cifras.map(c =>
            `<div class="trust-item"><span class="trust-number">${esc(c.valor)}</span><span class="trust-label">${esc(c.etiqueta)}</span></div>`).join('');
    };

    const initTestimonios = () => {
        const el = $('#testimonios');
        if (!el) return;
        const t = C.testimonios || [];
        if (!t.length) { el.remove(); return; }
        $('.testimonials-grid', el).innerHTML = t.map(x => `
            <figure class="testimonial-card">
                ${x.video ? embedVideo(x.video) : ''}
                ${x.texto ? `<blockquote class="testimonial-text">“${esc(x.texto)}”</blockquote>` : ''}
                <figcaption class="user-info"><h4>${esc(x.nombre)}</h4><p>${esc([x.perfil, x.ciudad].filter(Boolean).join(' · '))}</p></figcaption>
            </figure>`).join('');
    };

    const initImagenes = () => {
        const img = C.imagenes || {};
        document.querySelectorAll('[data-img]').forEach(el => {
            const src = img[el.dataset.img];
            if (src) {
                el.style.backgroundImage = `url("${src}")`;
                el.classList.add('has-img');
            }
        });
        const video = $('[data-hero-video]');
        if (video && img.heroInicioVideo) {
            video.innerHTML = `<video autoplay muted loop playsinline preload="none" ${img.heroInicio ? `poster="${esc(img.heroInicio)}"` : ''}><source src="${esc(img.heroInicioVideo)}" type="video/mp4"></video>`;
        }
        document.querySelectorAll('[data-img-tag]').forEach(el => {
            const src = img[el.dataset.imgTag];
            if (!src) return;
            el.querySelectorAll('.ph').forEach(ph => ph.remove());
            el.insertAdjacentHTML('afterbegin', fotoResponsive(src, el.dataset.alt || '', el.dataset.sizes || '(min-width: 900px) 60vw, 100vw'));
            el.classList.add('has-img');
        });
    };

    const initEventos = () => {
        const el = $('#eventosGaleria');
        if (!el) return;
        const ev = C.eventos || [];
        if (!ev.length) {
            el.innerHTML = ['Audiencia llena · CDMX', 'Dani presentando · Toluca', 'Networking · CDMX', 'Capacitación de asesores', 'Presentación de desarrollos', 'Webinar']
                .map(l => `<figure class="gallery-item">${placeholder(`[Foto: ${l}]`, 'fa-camera')}</figure>`).join('');
            return;
        }
        if (!el.classList.contains('photo-carousel')) { el.innerHTML = galeriaEventos(ev); return; }
        // Carrusel: nunca repite fotos. Se omiten las que ya aparecen en esta página
        // (las de data-img-tag automáticamente + las tomas casi iguales de data-excluir)
        const enPagina = [...document.querySelectorAll('[data-img-tag] img[data-full]')].map(i => i.dataset.full);
        const excluir = (el.dataset.excluir || '').split(',').map(x => x.trim()).filter(Boolean);
        const fotos = ev.filter(e => !enPagina.includes(e.src) && !excluir.some(x => e.src.includes(x)));
        el.innerHTML = `<div class="photo-carousel-track">${galeriaEventos(fotos)}</div>`;
        // Sin copias: si las fotos no caben, la cinta va y viene; si caben, se queda centrada
        const track = el.firstElementChild;
        const medir = () => {
            const sobra = track.scrollWidth - el.clientWidth;
            el.classList.toggle('is-moving', sobra > 0);
            el.style.setProperty('--carousel-shift', `${-Math.max(sobra, 0)}px`);
            el.style.setProperty('--carousel-dur', `${Math.max(12, sobra / 25)}s`);
        };
        track.querySelectorAll('img').forEach(i => i.addEventListener('load', medir));
        window.addEventListener('resize', medir);
        medir();
    };

    /* Visor de fotos: clic en cualquier foto de una galería para verla en grande */
    const initVisor = () => {
        let box, imgs = [], idx = 0;
        const mostrar = (i) => {
            idx = (i + imgs.length) % imgs.length;
            const img = $('img', box);
            img.src = imgs[idx].dataset.full || imgs[idx].currentSrc || imgs[idx].src;
            img.alt = imgs[idx].alt;
            $('.lightbox-count', box).textContent = `${idx + 1} / ${imgs.length}`;
        };
        const cerrar = () => { box.classList.remove('open'); document.body.style.overflow = ''; };
        const crear = () => {
            box = document.createElement('div');
            box.className = 'lightbox';
            box.setAttribute('role', 'dialog');
            box.setAttribute('aria-modal', 'true');
            box.setAttribute('aria-label', 'Galería de fotos');
            box.innerHTML = `
                <button class="lightbox-btn lightbox-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>
                <button class="lightbox-btn lightbox-prev" aria-label="Foto anterior"><i class="fas fa-chevron-left"></i></button>
                <img alt="">
                <button class="lightbox-btn lightbox-next" aria-label="Foto siguiente"><i class="fas fa-chevron-right"></i></button>
                <span class="lightbox-count"></span>`;
            document.body.appendChild(box);
            box.addEventListener('click', (e) => {
                if (e.target.closest('.lightbox-prev')) mostrar(idx - 1);
                else if (e.target.closest('.lightbox-next')) mostrar(idx + 1);
                else if (e.target === box || e.target.closest('.lightbox-close')) cerrar();
            });
            document.addEventListener('keydown', (e) => {
                if (!box.classList.contains('open')) return;
                if (e.key === 'Escape') cerrar();
                if (e.key === 'ArrowLeft') mostrar(idx - 1);
                if (e.key === 'ArrowRight') mostrar(idx + 1);
            });
        };
        document.addEventListener('click', (e) => {
            const img = e.target.closest('.gallery-item img');
            if (!img) return;
            if (!box) crear();
            imgs = [...img.closest('.gallery-grid, .photo-carousel').querySelectorAll('.gallery-item:not([aria-hidden]) img')];
            mostrar(Math.max(0, imgs.findIndex(i => i.dataset.full === img.dataset.full)));
            box.classList.add('open');
            document.body.style.overflow = 'hidden';
            $('.lightbox-close', box).focus();
        });
    };

    const initAliados = () => {
        const el = $('#aliados');
        if (!el) return;
        const a = C.aliados || [];
        if (!a.length) { el.remove(); return; }
        $('.partners-grid', el).innerHTML = a.map(x => {
            const logo = `<img class="partner-logo-img" src="${esc(x.logo)}" alt="${esc(x.nombre)}" loading="lazy">`;
            return `<div class="partner-logo-item">${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${logo}</a>` : logo}</div>`;
        }).join('');
    };

    const initContacto = () => {
        const el = $('#contactChannels');
        if (el) {
            const items = [];
            const wa = T.waLink && T.waLink();
            if (C.telefono) items.push(['fa-phone-alt', 'Teléfono', `<a href="tel:${esc(C.telefonoLink || C.telefono)}">${esc(C.telefono)}</a>`]);
            if (C.correo) items.push(['fa-envelope', 'Correo', `<a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a>`]);
            items.push(['fa-map-marker-alt', 'Oficina', esc([C.direccion, C.ciudad].filter(Boolean).join(', ')) || POR_CONFIRMAR]);
            items.push(['fa-clock', 'Horario', C.horario ? esc(C.horario) : POR_CONFIRMAR]);
            el.innerHTML = (wa ? `<a class="btn btn-whatsapp btn-block" href="${wa}" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Escríbenos por WhatsApp</a>` : '') +
                items.map(([icon, label, val]) => `
                <div class="channel-card">
                    <div class="channel-icon"><i class="fas ${icon}"></i></div>
                    <div class="channel-info"><label>${label}</label><span>${val}</span></div>
                </div>`).join('');
        }
        const agenda = $('#agendaEmbed');
        if (agenda) {
            if (C.ghlCalendarUrl) {
                agenda.innerHTML = `<iframe src="${esc(C.ghlCalendarUrl)}" title="Agenda tu asesoría" loading="lazy" class="calendar-embed"></iframe>`;
            } else {
                const wa = T.waLink && T.waLink('Hola, quiero agendar una asesoría con Torre Inversiones.');
                agenda.innerHTML = `${placeholder('[Calendario de GoHighLevel: pendiente de configurar]', 'fa-calendar-alt')}
                    ${wa ? `<p style="margin-top:1rem;text-align:center"><a class="btn btn-secondary" href="${wa}" target="_blank" rel="noopener noreferrer">Agendar por WhatsApp</a></p>` : ''}`;
            }
        }
    };

    /* ==========================================
       ARRANQUE
       ========================================== */
    initImagenes();
    initCifras();
    initTestimonios();
    initEventos();
    initVisor();
    initAliados();
    initContacto();
    initDestacados();
    initCatalogo();
    initFicha('#ficha', 'desarrollos');
    initFicha('#landing', 'landing', { landing: true });
    if (T.refreshWhatsApp) T.refreshWhatsApp();
})();

/**
 * Archivo: config.js
 * Configuración central del sitio Torre Inversiones.
 *
 * REGLA DEL BRIEF: si un texto, cifra, logo o testimonio no viene del brief o de Dani,
 * no se publica. Por eso todo lo que está en null / [] se OCULTA automáticamente
 * en el sitio hasta que se llene con el dato real.
 *
 * Todo lo marcado con "PENDIENTE DANI" debe confirmarse antes del lanzamiento.
 */
window.TORRE_CONFIG = {

    /* ---------- Contacto (confirmado por el cliente) ---------- */
    whatsapp: '529991913939',            // Solo dígitos, con lada de país (52) para wa.me
    telefono: '+52 (999) 191-3939',
    telefonoLink: '+529991913939',
    correo: 'torreinversiones@gmail.com',
    ciudad: 'Mérida, Yucatán',

    /* ---------- Redes sociales (null = no se muestra el ícono) ---------- */
    redes: {
        facebook: null,                  // ej. 'https://www.facebook.com/torreinversiones'
        instagram: null,
        youtube: null,
        tiktok: null,
        linkedin: null
    },

    /* ---------- Formularios ----------
     * formularioUrl: endpoint que recibe TODOS los formularios del sitio y los manda por correo.
     *   Se envía POST JSON { data: { ...campos } } con: nombre, telefono, correo, perfil,
     *   desarrollo, los campos del formulario, pagina_origen y UTM / fbclid.
     *   Responde { ok, message }.
     * calendarioUrl: (opcional) URL embebible del calendario de citas del CRM.
     *   Si es null, la sección "Agenda tu asesoría" muestra solo el botón de WhatsApp.
     */
    formularioUrl: 'https://emailform.avaspaceio.com/forms/torres-inversiones',
    calendarioUrl: null,

    /* ---------- Medición (se carga solo si el visitante acepta cookies) ---------- */
    metaPixelId: null,                   // PENDIENTE: se configura en la cita con Dani. ej. '123456789012345'

    /* ---------- Proyectos desde Space Broker (por organización) ----------
     * El admin de la organización copia su endpoint desde Space Broker y lo pega aquí.
     * Ej.: 'https://spacebroker.avaspaceio.com/api/v1/organizaciones/SLUG_ORGANIZACION/proyectos'
     *
     * - Si está configurado, la API es la fuente principal: los proyectos que el admin
     *   agregue, edite o pause en Space Broker aparecen/desaparecen solos en el sitio.
     * - desarrollos-data.js queda como respaldo (si la API falla, no está configurada o aún no regresa proyectos)
     *   y como complemento: si un slug coincide, rellena lo que la API no mande.
     * - Contrato del endpoint: ver API-SPACEBROKER.md
     */
    proyectosApiUrl: 'https://spacebroker.avaspaceio.com/api/v1/organizaciones/torre-inversiones/proyectos',
    proyectosImgBase: 'https://spacebroker.avaspaceio.com/',   // para rutas de imagen relativas

    /* ---------- Imágenes de marca (PENDIENTE DANI: fotos reales en WebP) ---------- */
    /* REGLA: ninguna foto se repite dentro de una misma página, ni tomas casi iguales.
     * Las fotos actuales son solo 5 escenas distintas:
     *   A) Banner Coterra ........ evento-01, 02, 03
     *   B) Selfie del equipo ..... evento-04 (= nosotros-hero, es la misma foto)
     *   C) Salón completo ........ evento-05
     *   D) Domo + Dani ........... evento-09
     *   E) Dani de pie ........... evento-06, 07, 08, 10, 11, 12
     * Máximo una foto de cada escena por página. Si no alcanza, la sección va sin foto (null). */
    imagenes: {
        heroInicio: 'img/eventos/evento-08.webp',                // Hero: Dani presentando frente a la audiencia (vertical, llena el arco)
        heroInicioVideo: null,           // Opcional: .mp4 corto (silenciado, en loop)
        bandaEventos: null,                                      // Sin foto: en Inicio ya salen las 5 escenas
        nosotrosHero: 'img/eventos/nosotros-hero.webp',          // Dani con asistentes en evento (IMG_1205)
        retratoDani: 'img/eventos/evento-07.webp', // Retrato profesional
        partnersHero: 'img/eventos/evento-04.webp',
        contactoHero: 'img/eventos/evento-03.webp',
        partnersBrokers: 'img/eventos/evento-12.webp',
        partnersDesarrolladores: 'img/eventos/evento-02.webp',
        // Inicio: una foto por sección
        inicioQueBuscas: 'img/eventos/evento-01.webp',
        inicioMetodo: null,                                      // Sin foto: evento-02 es casi igual a evento-01 (Qué buscas)
        inicioDestacados: 'img/eventos/evento-09.webp',
        inicioTipos: 'img/eventos/evento-04.webp',
        inicioPrincipios: 'img/eventos/evento-10.webp',
        // Desarrollos
        desarrollosHero: 'img/eventos/evento-09.webp',
        desarrollosCta: 'img/eventos/evento-01.webp'
    },

    /* ---------- Barra de confianza (PENDIENTE DANI) ----------
     * Solo cifras reales y comprobables. Si "valor" es null, esa cifra no aparece.
     * Si ninguna tiene valor, el bloque completo se oculta.
     */
    cifras: [
        { valor: '6', etiqueta: 'desarrolladores aliados' },
        { valor: '450+', etiqueta: 'brokers en nuestra red' },
        { valor: '8', etiqueta: 'años de experiencia en el sector inmobiliario' },
        { valor: null, etiqueta: 'asistentes a nuestros eventos' },
        { valor: null, etiqueta: 'ciudades donde hemos presentado' }
    ],

    /* ---------- Desarrolladores aliados (solo con autorización por escrito) ----------
     * Candidatos: Grupo Everland, Grupo Urbe, Grupo Empor, BAU Inmobiliaria, CoTerra.
     * Agregar aquí SOLO los que autoricen: { nombre: 'Grupo X', logo: 'img/aliados/grupo-x.webp', url: null }
     */
    aliados: [],

    /* ---------- Testimonios (solo reales, con nombre y autorización por escrito) ----------
     * { nombre: 'Nombre Apellido', ciudad: 'CDMX', perfil: 'Inversionista', texto: '...', video: null }
     * Si está vacío, el bloque se omite.
     */
    testimonios: [],

    /* ---------- Galería de eventos ----------
     * Una foto por escena (ver REGLA arriba), sin fotos casi iguales. Falta confirmar la fecha del evento.
     * { src: 'img/eventos/archivo.webp', ciudad: 'Toluca', fecha: 'marzo 2026', alt: '...' }
     */
    eventos: [
        { src: 'img/eventos/evento-05.webp', ciudad: 'Toluca', fecha: null, alt: 'Salón lleno de inversionistas durante el evento' },
        { src: 'img/eventos/evento-01.webp', ciudad: 'Toluca', fecha: null, alt: 'Equipo de Torre Inversiones en el evento' },
        { src: 'img/eventos/evento-09.webp', ciudad: 'Toluca', fecha: null, alt: 'Vista del salón durante la presentación' },
        { src: 'img/eventos/evento-04.webp', ciudad: 'Toluca', fecha: null, alt: 'Equipo de Torre Inversiones con asistentes al evento' },
        { src: 'img/eventos/evento-10.webp', ciudad: 'Toluca', fecha: null, alt: 'Presentación ante la audiencia' }
    ]
};

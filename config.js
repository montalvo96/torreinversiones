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

    /* ---------- Contacto (PENDIENTE DANI: confirmar que son los datos oficiales) ---------- */
    whatsapp: '529994960094',            // Solo dígitos, con lada de país (52) para wa.me
    telefono: '+52 (999) 496-0094',
    telefonoLink: '+529994960094',
    correo: 'contacto@torreinversiones.com',
    ciudad: 'Mérida, Yucatán',
    direccion: null,                     // PENDIENTE DANI: dirección de oficina, ej. 'Calle 60 #123, Centro'
    horario: null,                       // PENDIENTE DANI: ej. 'Lunes a viernes de 9:00 a 18:00 h'

    /* ---------- Redes sociales (null = no se muestra el ícono) ---------- */
    redes: {
        facebook: null,                  // ej. 'https://www.facebook.com/torreinversiones'
        instagram: null,
        youtube: null,
        tiktok: null,
        linkedin: null
    },

    /* ---------- GoHighLevel ----------
     * ghlWebhookUrl: URL de un "Inbound Webhook" (Workflow trigger) de GHL.
     *   Cada formulario envía un JSON con: nombre, telefono, correo, perfil, pipeline,
     *   desarrollo, interes, tags[], pagina_origen, utm_source, utm_medium, utm_campaign,
     *   utm_term, utm_content, fbclid y los campos propios del formulario.
     *   En el workflow de GHL se crea/actualiza el contacto, se agregan los tags
     *   y se envía al pipeline indicado ("Inversionistas", "Brokers", "Desarrolladores").
     * ghlCalendarUrl: URL del widget de calendario de GHL para agendar asesoría.
     */
    ghlWebhookUrl: null,                 // ej. 'https://services.leadconnectorhq.com/hooks/XXXX/webhook-trigger/YYYY'
    ghlCalendarUrl: null,                // ej. 'https://api.leadconnectorhq.com/widget/booking/XXXX'

    /* ---------- Medición (se cargan solo si el visitante acepta cookies) ---------- */
    ga4Id: null,                         // ej. 'G-XXXXXXXXXX'
    metaPixelId: null,                   // ej. '123456789012345'

    /* ---------- Proyectos desde Space Broker (por organización) ----------
     * El admin de la organización copia su endpoint desde Space Broker y lo pega aquí.
     * Ej.: 'https://spacebroker.avaspaceio.com/api/organizaciones/ID_ORGANIZACION/proyectos'
     *
     * - Si está configurado, la API es la fuente principal: los proyectos que el admin
     *   agregue, edite o pause en Space Broker aparecen/desaparecen solos en el sitio.
     * - desarrollos-data.js queda como respaldo (si la API falla o no está configurada)
     *   y como complemento: si un slug coincide, rellena lo que la API no mande.
     * - Contrato del endpoint: ver API-SPACEBROKER.md
     */
    proyectosApiUrl: null,
    proyectosImgBase: 'https://spacebroker.avaspaceio.com/',   // para rutas de imagen relativas

    /* ---------- Imágenes de marca (PENDIENTE DANI: fotos reales en WebP) ---------- */
    imagenes: {
        heroInicio: null,                // Foto/video de fondo del hero: desarrollo o Dani en evento
        heroInicioVideo: null,           // Opcional: .mp4 corto (silenciado, en loop)
        bandaEventos: null,              // Panorámica CDMX o Toluca con Dani frente a la audiencia
        nosotrosHero: null,              // Dani hablando frente a una audiencia
        retratoDani: null                // Retrato profesional
    },

    /* ---------- Barra de confianza (PENDIENTE DANI) ----------
     * Solo cifras reales y comprobables. Si "valor" es null, esa cifra no aparece.
     * Si ninguna tiene valor, el bloque completo se oculta.
     */
    cifras: [
        { valor: null, etiqueta: 'desarrolladores aliados' },
        { valor: null, etiqueta: 'brokers en nuestra red' },
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

    /* ---------- Galería de eventos (PENDIENTE DANI: 6–12 fotos) ----------
     * { src: 'img/eventos/cdmx-01.webp', ciudad: 'CDMX', fecha: 'marzo 2026', alt: 'Dani presentando ante la audiencia' }
     */
    eventos: [
        { src: 'img/eventos/evento-10.webp', ciudad: null, fecha: null, alt: 'Presentación ante la audiencia' },
        { src: 'img/eventos/evento-05.webp', ciudad: null, fecha: null, alt: 'Salón lleno de inversionistas durante el evento' },
        { src: 'img/eventos/evento-02.webp', ciudad: null, fecha: null, alt: 'Equipo de Torre Inversiones junto a la presentación del proyecto' },
        { src: 'img/eventos/evento-06.webp', ciudad: null, fecha: null, alt: 'Presentación ante inversionistas' },
        { src: 'img/eventos/evento-09.webp', ciudad: null, fecha: null, alt: 'Vista del salón durante la presentación' },
        { src: 'img/eventos/evento-04.webp', ciudad: null, fecha: null, alt: 'Selfie del equipo de Torre Inversiones en el evento' },
        { src: 'img/eventos/evento-07.webp', ciudad: null, fecha: null, alt: 'Presentación ante inversionistas' },
        { src: 'img/eventos/evento-01.webp', ciudad: null, fecha: null, alt: 'Equipo de Torre Inversiones en el evento' },
        { src: 'img/eventos/evento-11.webp', ciudad: null, fecha: null, alt: 'Presentación ante la audiencia' },
        { src: 'img/eventos/evento-03.webp', ciudad: null, fecha: null, alt: 'Equipo de Torre Inversiones en el stand' },
        { src: 'img/eventos/evento-08.webp', ciudad: null, fecha: null, alt: 'Presentación ante inversionistas' },
        { src: 'img/eventos/evento-12.webp', ciudad: null, fecha: null, alt: 'Presentación ante la audiencia' }
    ]
};

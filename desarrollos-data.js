/**
 * Archivo: desarrollos-data.js
 * Fichas de los desarrollos (plantilla de la sección 5.2 del brief).
 *
 * Los textos entre [corchetes] son datos que Dani debe entregar. Mientras un campo
 * sea null o una lista esté vacía, en la ficha aparece "Por confirmar" o el bloque se oculta
 * (excepto "Lo que debes saber", que NUNCA se omite).
 *
 * Valores válidos para los filtros:
 *   zona:  'merida' | 'riviera-maya'   (agregar más en ZONAS de index.js)
 *   tipo:  'lote' | 'departamento' | 'casa' | 'agroinversion'
 *   etapa: 'preventa' | 'construccion' | 'entrega-inmediata'
 *   precioDesde: número en MXN (sin comas) o null
 *
 * Campos:
 *   slug, nombre, activo (false = pausado, no aparece), destacado (aparece en Inicio),
 *   ubicacion, zona, tipo, etapa, precioDesde, entrega, resumen,
 *   portada, galeria[], video (URL de embed de YouTube/Vimeo),
 *   porQueNosGusta[], loQueDebesSaber[], desarrollador {nombre, trayectoria},
 *   mapa {query, puntosDeInteres[]}, producto {tipologias[{nombre, superficie, precio}], esquemasPago[]},
 *   legal[{documento, verificado}], escenarios {supuestos[], filas[{escenario, valor}]} | null,
 *   brochure (URL del PDF o null)
 */
window.TORRE_DESARROLLOS = [
    {
        slug: 'gran-via-del-mar',
        nombre: 'Gran Vía del Mar',
        activo: true,
        destacado: true,
        ubicacion: 'Puerto Morelos, Quintana Roo',
        zona: 'riviera-maya',
        tipo: null,                     // PENDIENTE DANI: 'lote' | 'departamento' | 'casa'
        etapa: null,                    // PENDIENTE DANI
        precioDesde: null,              // PENDIENTE DANI
        entrega: null,                  // PENDIENTE DANI: ej. 'diciembre 2027'
        resumen: 'Desarrollo en Puerto Morelos, en la Riviera Maya. [Descripción breve por confirmar].',
        portada: null,
        galeria: [],
        video: null,
        porQueNosGusta: [
            '[Punto 1 por confirmar]',
            '[Punto 2 por confirmar]',
            '[Punto 3 por confirmar]'
        ],
        loQueDebesSaber: [
            '[Tiempos de entrega: por confirmar]',
            '[Liquidez: por confirmar]',
            '[Dependencia del mercado: por confirmar]'
        ],
        desarrollador: { nombre: null, trayectoria: null },
        mapa: { query: 'Puerto Morelos, Quintana Roo', puntosDeInteres: [] },
        producto: { tipologias: [], esquemasPago: [] },
        legal: [
            { documento: 'Uso de suelo', verificado: null },
            { documento: 'Propiedad / escrituras', verificado: null },
            { documento: 'Permisos y licencias', verificado: null }
        ],
        escenarios: null,
        brochure: null
    },
    {
        slug: 'citrus-patrimonial',
        nombre: 'Citrus Patrimonial',
        activo: true,
        destacado: true,
        ubicacion: null,                // PENDIENTE DANI
        zona: null,
        tipo: 'agroinversion',
        etapa: null,
        precioDesde: null,
        entrega: null,
        resumen: 'Agroinversión ligada al cultivo de cítricos, para diversificar más allá del ladrillo. [Descripción breve por confirmar].',
        portada: null,
        galeria: [],
        video: null,
        porQueNosGusta: [
            '[Punto 1 por confirmar]',
            '[Punto 2 por confirmar]',
            '[Punto 3 por confirmar]'
        ],
        loQueDebesSaber: [
            '[Riesgos agrícolas (clima, plagas, precio de la cosecha): por confirmar]',
            '[Plazo hasta la primera cosecha: por confirmar]',
            '[Liquidez: por confirmar]'
        ],
        desarrollador: { nombre: null, trayectoria: null },
        mapa: { query: null, puntosDeInteres: [] },
        producto: { tipologias: [], esquemasPago: [] },
        legal: [
            { documento: 'Uso de suelo', verificado: null },
            { documento: 'Propiedad / escrituras', verificado: null },
            { documento: 'Contrato de operación agrícola', verificado: null }
        ],
        escenarios: null,
        brochure: null
    }
    // PENDIENTE DANI: tercer desarrollo destacado
];

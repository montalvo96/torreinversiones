# Endpoint público de proyectos por organización — Space Broker

Documento para el equipo de **kavanaproapp 3.0 / Space Broker**. Describe lo que el sitio
torreinversiones.com (y cualquier landing de otra organización) necesita para dibujar
las cards y fichas de proyectos de forma dinámica.

## Idea

Cada organización de Space Broker tiene un endpoint público de solo lectura con sus proyectos
publicados. El admin de la organización lo copia desde la plataforma (por ejemplo en
*Configuración → Integraciones → Mi landing page*) y lo pega en su sitio. El sitio consume
el JSON y dibuja los proyectos, igual que una "PokeAPI".

> **Confirmado en el código:** los proyectos pertenecen a la **organización**.
> `App\Models\Proyecto` usa el trait `BelongsToOrganizacion` (columna `organizacion_id`), y
> `App\Models\Organizacion` ya tiene `slug`.

## Ruta

```
GET https://spacebroker.avaspaceio.com/api/organizaciones/{slug_organizacion}/proyectos
```

- Usar el `slug` de `organizaciones` (ej. `torre-inversiones`) en vez del id numérico, para que
  no se puedan recorrer las organizaciones.
- Opcional: `GET .../proyectos/{id}` para un solo proyecto.

## Implementación sugerida (Laravel)

**Ojo con el multi-tenant:** el global scope de `BelongsToOrganizacion` NO filtra cuando no hay
organización en contexto (como en una ruta pública). Por eso el endpoint debe filtrar a mano por
`organizacion_id` y `publicado`; si no, regresaría proyectos de todas las organizaciones.

```php
// routes/api.php
Route::get('/organizaciones/{slug}/proyectos', [ProyectosPublicosController::class, 'index'])
    ->middleware('throttle:60,1');

// app/Http/Controllers/ProyectosPublicosController.php
public function index(string $slug)
{
    $org = Organizacion::where('slug', $slug)->where('estado', 'activa')->firstOrFail(); // ajustar valor de "estado"

    $proyectos = Proyecto::sinOrganizacion()
        ->where('organizacion_id', $org->id)
        ->where('publicado', true)
        ->with('mediaProyectos:id,id_proyecto,url_imagen,descripcion')
        ->get([
            'id', 'nombre', 'descripcion', 'url_imagen', 'tags', 'tipo_desarrollo',
            'estado_construccion', 'ciudad', 'estado_ubicacion', 'direccion', 'latitud', 'longitud',
            'amenidades', 'precio_desde', 'precio_hasta', 'superficie_desde', 'superficie_hasta',
            'video_url', 'fecha_entrega',
        ])
        ->map(fn ($p) => array_merge($p->toArray(), [
            'slug' => Str::slug($p->nombre),
            'link_publico' => url("open/{$p->id}"),
        ]));

    return response()
        ->json(['success' => true, 'organizacion' => ['slug' => $org->slug, 'nombre' => $org->nombre], 'data' => $proyectos])
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Cache-Control', 'public, max-age=300');
}
```

Nunca exponer `organizacion_id` real, comisiones, cotizaciones, clientes ni datos de usuarios.

### Campos que el sitio ya entiende tal como están en `proyectos`

`nombre`, `descripcion`, `url_imagen`, `tags`, `tipo_desarrollo`, `estado_construccion`,
`ciudad` + `estado_ubicacion`, `direccion`, `latitud`/`longitud` (mapa), `amenidades`,
`precio_desde`, `video_url`, `fecha_entrega` (se muestra como "diciembre 2027"), `publicado`
y `media_proyectos[].url_imagen` (galería). No hace falta renombrar nada.

### Campos que hoy NO existen en Space Broker (para la ficha completa)

Para que la ficha muestre todo lo del brief, habría que agregar a `proyectos` (o a una tabla
relacionada) estos campos, editables por el admin:

- `destacado` (boolean): aparece en Inicio
- `lo_que_debes_saber` (lista de textos): riesgos, el bloque principal de la ficha
- `por_que_nos_gusta` (lista de textos)
- `legal` (lista de `{documento, verificado}`)
- `desarrollador` (`{nombre, trayectoria}`)
- `esquemas_pago` (lista de textos) y `tipologias` (o reutilizar `unidades`)
- `escenarios` (`{supuestos[], filas[{escenario, valor}]}`)
- `brochure` (URL del PDF)

Mientras no existan, el sitio muestra "Por confirmar" en esas secciones.

## Seguridad

- **Público, sin token.** Una clave pegada en una página pública la puede ver cualquiera, así que
  no protege nada. Lo que protege es *qué* regresa el endpoint.
- **Solo proyectos publicados** (`publicado = true`, no pausados ni en borrador).
- **Solo campos públicos.** Nunca incluir: comisiones, datos de brokers o clientes, costos
  internos, notas privadas, correos o teléfonos del equipo.
- **CORS:** `Access-Control-Allow-Origin: *` en esta ruta (solo `GET`), para que cualquier
  dominio pueda consumirla.
- **Caché y límite de peticiones:** `Cache-Control: public, max-age=300` y rate limit por IP.

## Respuesta

`200 OK`, `Content-Type: application/json`

```json
{
  "success": true,
  "organizacion": { "id": "torre-inversiones", "nombre": "Torre Inversiones" },
  "data": [
    {
      "id": 12,
      "slug": "gran-via-del-mar",
      "nombre": "Gran Vía del Mar",
      "publicado": true,
      "destacado": true,
      "ubicacion": "Puerto Morelos, Quintana Roo",
      "zona": "Riviera Maya",
      "tipo": "Lote",
      "etapa": "Preventa",
      "precio_desde": 850000,
      "moneda": "MXN",
      "entrega": "Diciembre 2027",
      "resumen": "Descripción corta para la card (1–2 líneas).",
      "tags": ["Cerca de la playa", "Financiamiento"],
      "portada": "https://.../portada.webp",
      "imagenes": ["https://.../1.webp", "https://.../2.webp"],
      "video": "https://www.youtube.com/watch?v=XXXX",
      "por_que_nos_gusta": ["Punto 1", "Punto 2", "Punto 3"],
      "lo_que_debes_saber": ["Riesgo 1", "Riesgo 2"],
      "desarrollador": { "nombre": "Grupo X", "trayectoria": "Texto comprobable." },
      "puntos_de_interes": ["Playa a 5 min", "Aeropuerto de Cancún a 25 min"],
      "tipologias": [
        { "nombre": "Lote A", "superficie": "250 m²", "precio": 850000 }
      ],
      "esquemas_pago": ["Contado 10% descuento", "Enganche 30% y 24 meses"],
      "legal": [
        { "documento": "Uso de suelo", "verificado": true },
        { "documento": "Escrituras", "verificado": true },
        { "documento": "Licencia de construcción", "verificado": false }
      ],
      "escenarios": {
        "supuestos": ["Plusvalía anual de X% según ...", "Ocupación de Y%"],
        "filas": [
          { "escenario": "Conservador", "valor": "X% anual" },
          { "escenario": "Moderado", "valor": "Y% anual" }
        ]
      },
      "brochure": "https://.../brochure.pdf",
      "link_publico": "https://spacebroker.avaspaceio.com/open/12",
      "actualizado_en": "2026-11-17T10:00:00Z"
    }
  ]
}
```

### Campos

| Campo | Requerido | Uso en el sitio |
|---|---|---|
| `slug` | Sí | URL de la ficha: `/desarrollos/{slug}`. Si falta, se genera desde `nombre`. |
| `nombre` | Sí | Título de card y ficha. |
| `portada` | Recomendado | Foto de la card. Si falta, se usa la primera de `imagenes`. |
| `ubicacion`, `tipo`, `etapa`, `precio_desde`, `entrega` | Recomendado | Card, resumen de 4 datos y **filtros** del catálogo. Texto libre: el sitio los reconoce ("Preventa", "En construcción", "Departamento", "Agroinversión"…). |
| `zona` | Opcional | Filtro de ubicación. Si falta, se deduce de `ubicacion`. |
| `destacado` | Opcional | Los destacados aparecen en Inicio (máximo 3). |
| `tags` | Opcional | Chips en la card. |
| `lo_que_debes_saber` | **Muy recomendado** | Bloque de riesgos de la ficha. Es el sello de Torre y nunca se oculta; si falta, aparece "Por confirmar". |
| `por_que_nos_gusta`, `desarrollador`, `puntos_de_interes`, `tipologias`, `esquemas_pago`, `legal`, `escenarios` | Opcional | Secciones de la ficha. |
| `brochure` | Opcional | Se abre después de que el visitante deja sus datos (el lead llega por correo). |
| `link_publico` | Opcional | Enlace secundario "Ver presentación completa del proyecto" en la ficha. |

El sitio es tolerante: también reconoce `data` paginado (`data.data`), un arreglo en la raíz,
y nombres alternativos (`name`, `price`, `images`, `status`…). Si `estatus` contiene
"pausado", "borrador" o "inactivo", el proyecto no se muestra.

## En el sitio

En `config.js` de torreinversiones.com:

```js
proyectosApiUrl: 'https://spacebroker.avaspaceio.com/api/organizaciones/torre-inversiones/proyectos',
```

Mientras el endpoint no exista, el sitio usa los proyectos de `desarrollos-data.js`.

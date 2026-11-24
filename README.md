# Torre Inversiones — sitio web

Sitio estático (HTML + CSS + JS, sin build). Contenido según el brief del 13 nov 2026.

## Correr en local

```bash
npx serve .
```

`serve.json` activa las URLs limpias (`/desarrollos/<slug>`, `/landing/<slug>`). En hosting Apache/cPanel lo hace `.htaccess`.

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| WhatsApp, teléfono, correo, horario, redes | `config.js` |
| Correo que recibe los formularios y calendario opcional | `config.js` → `formularioCorreo`, `calendarioUrl` |
| Meta Pixel (carga solo si el visitante acepta cookies) | `config.js` → `metaPixelId` |
| Cifras de confianza, aliados, testimonios, fotos de eventos | `config.js` (vacío = el bloque se oculta) |
| Proyectos | Endpoint de Space Broker en `config.js` → `proyectosApiUrl` (contrato en `API-SPACEBROKER.md`); respaldo en `desarrollos-data.js` |
| Header, footer, WhatsApp flotante, cookies, envío de formularios | `layout.js` |
| Catálogo, filtros, ficha, landing | `index.js` |

## Formularios → correo

Todo `<form data-lead-form>` se envía por FormSubmit.co al correo de `formularioCorreo` con: datos del form,
`perfil`, `pipeline` (Inversionistas / Brokers / Desarrolladores), `desarrollo`, `tags`, `pagina_origen`,
`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` y `fbclid`.
El primer envío llega como correo de activación de FormSubmit: hay que dar clic en "Activate" una vez.

## Pendientes antes de lanzar

Revisa todo lo marcado como `PENDIENTE DANI` en `config.js` y `desarrollos-data.js`, más las páginas legales (borrador pendiente de revisión por abogado).

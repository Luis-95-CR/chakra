# La Chakra — Lista de precios

Sitio web de **La Chakra** (granja porcina · carnes de res, cerdo y pollo) para
publicar una lista de precios que se carga desde un archivo de Excel. Tiene un
solo usuario administrador que sube el Excel y una vista pública con una landing
y un catálogo de productos.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (UI)
- **SheetJS (`xlsx`)** para leer el Excel
- **iron-session** para el acceso del administrador (un solo usuario)
- **Upstash Redis** para guardar el catálogo (con _fallback_ a un archivo local
  `.data/catalog.json` en desarrollo, sin necesidad de configurar nada)

## Cómo funciona

1. El administrador entra a `/admin`, ingresa la contraseña y sube un Excel.
2. La app muestra una **vista previa** y advierte que se reemplazará todo.
3. Al confirmar, el catálogo anterior se **reemplaza por completo**.
4. La página principal `/` muestra los productos con búsqueda y filtro por
   categoría.

### Columnas que lee el Excel

La primera hoja debe tener encabezados (sin importar mayúsculas ni acentos):

| Columna           | Obligatoria | Notas                   |
| ----------------- | ----------- | ----------------------- |
| Producto          | Sí          | Nombre del producto     |
| Categoria         | No          | Para agrupar y filtrar  |
| Descripcion       | No          | Texto adicional         |
| Precio Granel     | No\*        | Precio por presentación |
| Precio 1 Kilo     | No\*        | Precio por presentación |
| Precio ½ Kilo     | No\*        | Precio por presentación |
| Precio ¼ Kilo     | No\*        | Precio por presentación |

\* Debe existir al menos **una** columna de precio.

Hay un archivo de ejemplo en `ejemplo-precios-carnes.xlsx` (Granel en todos los
productos).

### Archivos para probar errores

La carpeta `ejemplos-prueba/` contiene archivos para validar el camino no-feliz:

| Archivo                            | Qué provoca                                            |
| ---------------------------------- | ----------------------------------------------------- |
| `error-sin-columna-producto.xlsx`  | Error: falta la columna **Producto**                  |
| `error-sin-precios.xlsx`           | Error: no hay ninguna columna de precio               |
| `error-hoja-vacia.xlsx`            | Error: la hoja no tiene filas                          |
| `avisos-filas-invalidas.xlsx`      | Carga con **advertencias** (filas sin nombre omitidas) |

## Desarrollo

```bash
npm install
cp .env.example .env   # ajusta ADMIN_PASSWORD y SESSION_SECRET
npm run dev            # http://localhost:3000
```

En desarrollo, si no defines las variables de Upstash, el catálogo se guarda en
`.data/catalog.json` automáticamente.

## Despliegue (Vercel + Upstash, plan gratuito)

1. Crea una base de datos **Upstash Redis** (desde el Marketplace de Vercel o en
   upstash.com) y copia su `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
2. Importa el repo en Vercel y configura las variables de entorno:
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET` (string aleatorio de 32+ caracteres)
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Deploy. Listo.

## Personalización

Edita `lib/config.ts` para cambiar el nombre del negocio, el lema, la moneda y
el idioma.

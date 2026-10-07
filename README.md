# Mistik World API

NestJS + Prisma + PostgreSQL backend for the Mistik World product catalog, plus an embeddable Readymag storefront widget.

## Local setup

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
make dev
```

In another terminal, seed the database once:

```bash
docker compose exec backend npm run seed
```

Swagger runs at:

```text
http://localhost:3000/docs
```

Frontend runs at:

```text
http://localhost:5173
```

## Useful endpoints

- `POST /auth/login`
- `GET /public/artist-profile`
- `GET /public/products`
- `GET /public/products/:slug`
- `GET /admin/artist-profile`
- `PATCH /admin/artist-profile`
- `GET /admin/products`
- `POST /admin/products`
- `PATCH /admin/products/:id/cover-image`
- `GET /admin/products/:productId/images`
- `POST /admin/products/:productId/images`

## Readymag product widget

The storefront product detail is built as an embeddable JavaScript widget so Readymag remains responsible for the page itself while this repository provides product data and commerce behavior.

Build the widget:

```bash
cd frontend
npm run build:widget
```

The output is:

```text
frontend/dist-widget/mistik-product.js
```

Host that file on a public HTTPS URL and place this snippet inside a Readymag Code widget:

```html
<div
  data-mistik-product="anillo-dos"
  data-api-url="https://api.example.com"
  data-catalog-url="https://mistikworld.com.ar/productos"
  data-product-base-url="https://mistikworld.com.ar/productos/"
></div>
<script src="https://static.example.com/mistik-product.js"></script>
```

Attributes:

- `data-mistik-product`: product slug from the API.
- `data-api-url`: public NestJS API URL, without a trailing slash.
- `data-catalog-url`: URL used by “Volver a ver todos los productos”.
- `data-product-base-url`: base URL used for related product links.

The widget renders the image gallery, title, short description, size selector, price, add-to-cart action, long description, and up to three related products. Shipping / postal-code calculation is intentionally not included.

Cart items are stored in browser `localStorage` under `mistik-cart-v1`. Each add-to-cart action also dispatches a `mistik:cart-updated` browser event so a separate Readymag cart widget can react to changes later.


## Product domain naming

The application code uses `Product`, `ProductImage`, and `ProductStatus` throughout the backend and storefront APIs.

To preserve existing database data without a destructive table rename, Prisma maps those models to the legacy PostgreSQL tables `Project`, `ProjectImage`, and enum `ProjectStatus`. This is intentional compatibility glue and can be removed later with an explicit production migration if desired.

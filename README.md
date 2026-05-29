# Artist Portfolio API

NestJS + Prisma + PostgreSQL backend for an artist portfolio with a small admin API.

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
- `GET /public/projects`
- `GET /public/projects/:slug`
- `GET /admin/artist-profile`
- `PATCH /admin/artist-profile`
- `GET /admin/projects`
- `POST /admin/projects`
- `PATCH /admin/projects/:id/cover-image`
- `GET /admin/projects/:projectId/images`
- `POST /admin/projects/:projectId/images`

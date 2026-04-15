# Personal Journal

A full-stack **private journal** application: a **Spring Boot** REST API with JWT authentication and a **React** (Vite + TypeScript) SPA. Each signed-in user keeps their own entries, **categories**, and **tags**—nothing is shared across accounts. The UI is built around a **calendar**, **journal days** (`entryDate`), and filters (category, tag, search) with **shareable URLs**.

## Features

- **Authentication** — Register, log in, JWT stored in the browser; protected routes on the SPA.
- **Entries (posts)** — Draft or published, rich text (TipTap), reading time, optional backdated **journal day**.
- **Per-user labels** — Categories and tags belong to the logged-in user only; duplicate names are allowed for different users in the database.
- **Journal home** — Month calendar with days that have entries highlighted; list filtered by selected day and/or category/tag/search.
- **Browse by label** — From **Categories** or **Tags**, click a name to open the journal filtered to all entries for that label (URL-driven).
- **URL state** — Query params such as `date`, `categoryId`, `tagId`, and `q` keep filters across refresh and sharing.

## Tech stack

| Layer    | Technologies |
|----------|----------------|
| Backend  | Java 21, Spring Boot 4, Spring Data JPA, PostgreSQL, Spring Security, JWT, MapStruct, Lombok, **Flyway** (migrations) |
| Frontend | React 18, TypeScript, Vite, NextUI, Tailwind CSS, TipTap, Axios, React Router, react-day-picker |

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/BACKEND_REFERENCE.md](docs/BACKEND_REFERENCE.md) | API architecture, security, entities, Flyway, deployment notes |
| [docs/FRONTEND_REFERENCE.md](docs/FRONTEND_REFERENCE.md) | SPA structure, auth, routing, journal URL patterns, build |
| [DEPLOY.md](DEPLOY.md) | Render blueprint, env vars, CORS, Supabase/Neon |

## Repository layout

```
docker-compose.yml       # PostgreSQL + Adminer (local dev database)
.env.example             # Template for local secrets (copy to .env — never commit .env)
pom.xml                  # Spring Boot API (Maven root)
src/main/java/...
src/main/resources/
  application.properties
  application-prod.properties
  db/migration/          # Flyway SQL (e.g. schema upgrades for existing DBs)
docs/                    # Backend & frontend reference guides
blog-frontend/           # React SPA
render.yaml              # Render Blueprint (API + static site)
```

## Prerequisites

- **JDK 21**
- **Maven 3.9+**
- **Node.js 20+** (LTS) and npm
- **Docker** with Docker Compose (recommended), *or* your own PostgreSQL

## Docker Compose (database)

The repo includes **`docker-compose.yml`** for **PostgreSQL** and **Adminer**. Optional: copy **`.env.example`** to **`.env`** to set **`POSTGRES_PASSWORD`**.

```bash
docker compose up -d
```

| Service   | Purpose |
|-----------|---------|
| `db`      | Database `blog` on port **5432** |
| `adminer` | Web UI at **http://localhost:8888** — use **PostgreSQL**, server **`db`**, user/password from env, database **`blog`** |

```bash
docker compose down
```

## Backend setup

1. **Start PostgreSQL** (Docker Compose or your own). Create database `blog` if needed.

2. **Configuration** — `src/main/resources/application.properties` and **environment variables**:

   - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
   - `JWT_SECRET` — long random value (**required in production**)
   - `jwt.expiration-ms` — token lifetime (default 8 hours)
   - `spring.profiles.active` — defaults to **`dev`** (seeds a test user via `DevUserSeedRunner`). Use **`prod`** on hosted environments so the seed does not run.
   - `APP_CORS_ALLOWED_ORIGINS` — comma-separated SPA origins in production

   **Schema:** **Flyway** runs migrations on startup (PostgreSQL requires **`flyway-database-postgresql`** on the classpath). Hibernate **`ddl-auto=update`** complements local dev; production uses **`application-prod.properties`** (Flyway baseline settings for existing databases). See [docs/BACKEND_REFERENCE.md](docs/BACKEND_REFERENCE.md).

3. **Run the API** from the repo root:

   ```bash
   mvn spring-boot:run
   ```

   API base path: **`http://localhost:8080/api/v1`**.

4. **IDE:** Run **`mvn compile`** so MapStruct generates mapper implementations (`PostMapperImpl`, etc.).

## Frontend setup

```bash
cd blog-frontend
npm install
npm run dev
```

Vite (**http://localhost:5173**) proxies **`/api`** → **http://localhost:8080** (see `blog-frontend/vite.config.ts`).

**Production build:** `npm run build` → static assets in `blog-frontend/dist/`. Set **`VITE_API_BASE_URL`** to the full API root including **`/api/v1`** at build time (e.g. `https://your-api.onrender.com/api/v1`).

## Using the application locally

1. `docker compose up -d` → `mvn spring-boot:run` → `npm run dev` in `blog-frontend/`.
2. Open **http://localhost:5173**. **Sign up** at `/signup` or **Log in** at `/login`. With profile **`dev`**, a seed user is also created (see `DevUserSeedRunner` and `dev.seed-user.*`).
3. Create **categories** and **tags** under the nav links; add **entries** from the journal home or **Drafts**.
4. Use the **calendar** to pick a day; use filters or links from Categories/Tags to narrow the list.

## API overview (authenticated)

All journal data endpoints expect an `Authorization: Bearer <token>` header. Base path: **`/api/v1`**.

| Area | Examples |
|------|----------|
| Auth | `POST /auth/login`, `POST /auth/register` |
| Posts | `GET /posts` (query: `categoryID`, `tagID`, `search`, `entryDate`), `GET /posts/drafts`, CRUD on `/posts` and `/posts/{id}` |
| Categories / Tags | `GET`/`POST`/`PUT`/`DELETE` under `/categories`, `/tags` (scoped to the current user) |
| Journal | `GET /journal/calendar?year=&month=` — days with entries for the calendar UI |

The React client is implemented in **`blog-frontend/src/services/apiService.ts`**.

## Testing and CI

- Run backend tests: `mvn verify` (or `mvn test`) from the repository root. Tests use the H2 profile under `src/test/resources/application.properties`.
- GitHub Actions (`.github/workflows/ci.yml`) runs `mvn -B verify` and, in `blog-frontend/`, `npm ci`, `npm run lint`, and `npm run build` on pushes and pull requests to `main` / `master`.

## Deployment

- **Render:** [render.yaml](render.yaml) — **New → Blueprint**; see [DEPLOY.md](DEPLOY.md) for env vars (`JWT_SECRET`, datasource, `APP_CORS_ALLOWED_ORIGINS`, `VITE_API_BASE_URL`).
- **Vercel (frontend only):** root **`blog-frontend`**; [blog-frontend/vercel.json](blog-frontend/vercel.json) for SPA routing.

---

**License:** See [blog-frontend/LICENSE](blog-frontend/LICENSE).

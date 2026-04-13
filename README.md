# Blog Platform

A full-stack blog application: a **Spring Boot** REST API with JWT authentication, and a **React** (Vite + TypeScript) client. Authors can manage posts (drafts and published), categories, and tags; visitors can browse published content with optional filters.

## Tech stack

| Layer    | Technologies |
|----------|----------------|
| Backend  | Java 21, Spring Boot 4, Spring Data JPA, PostgreSQL, Spring Security, JWT, MapStruct, Lombok |
| Frontend | React 18, TypeScript, Vite, NextUI, Tailwind CSS, TipTap, Axios |

## Repository layout

```
docker-compose.yml       # PostgreSQL + Adminer (local dev database)
blog/                    # Spring Boot API (this Maven project)
  src/main/java/...
  src/main/resources/application.properties
blog-frontend/           # React SPA
  package.json
  vite.config.ts         # dev server proxies /api → backend
```

## Prerequisites

- **JDK 21**
- **Maven 3.9+**
- **Node.js 20+** (LTS recommended) and npm
- **Docker** with Docker Compose (recommended for the database), *or* your own PostgreSQL instance

## Docker Compose (database)

The repo includes **`docker-compose.yml`** (there is no separate `Dockerfile` for the app itself), which starts **PostgreSQL** with a ready-to-use database and **Adminer** for browsing the DB in a browser. You do **not** need to create the database manually.

From the repository root:

```bash
docker compose up -d
```

(If your setup still uses Compose V1, use `docker-compose up -d` instead.)

| Service  | Image             | Purpose |
|----------|-------------------|---------|
| `db`     | `postgres:latest` | Database `blog` on port **5432** (see `POSTGRES_*` variables in `docker-compose.yml`). |
| `adminer`| `adminer:latest`  | Web UI at **http://localhost:8888** — see **Adminer** below. |

### Adminer

Open **http://localhost:8888**. On the login screen:

1. **System** — choose **PostgreSQL** (not MySQL/MariaDB). Using the wrong engine produces errors such as **“Connection refused”** because Adminer speaks the wrong protocol.
2. **Server** — `db` (the Docker Compose service name; Adminer runs on the same network and resolves it).
3. **Username** — `postgres` (default for the `postgres` image).
4. **Password** — same value as **`POSTGRES_PASSWORD`** in `docker-compose.yml`.
5. **Database** — `blog` (created automatically via **`POSTGRES_DB`**).

If login still fails, confirm both containers are up: `docker compose ps`, and that you ran `docker compose up -d` from the directory that contains **`docker-compose.yml`**.

Stop the stack when finished:

```bash
docker compose down
```

Keep **`src/main/resources/application.properties`** in sync with the compose file: URL, username, password, and database name should match the `db` service (defaults assume `localhost:5432` and database **`blog`**).

## Backend setup

1. **Start PostgreSQL** — typically via **Docker Compose** (above). If you use another server, create a database named `blog` (or change the URL in `application.properties`).

2. **Configure the API** in `src/main/resources/application.properties`:

   - `spring.datasource.*` — must match your PostgreSQL instance (Docker defaults are aligned with `docker-compose.yml`).
   - `jwt.secret` — use a long, random secret (at least **32 bytes** for HS256 with JJWT). Override via environment in production; do not commit real secrets.
   - `jwt.expiration-ms` — access-token lifetime in milliseconds (default eight hours).
   - `spring.profiles.active` — defaults to **`dev`**, which runs a small **seed user** (`dev.seed-user.*` in `application.properties`). Set `DEV_SEED_USER_PASSWORD` to choose the password, or switch profile (e.g. `prod`) in production so the seed does not run.

   Hibernate is set to `ddl-auto=update`, so schema is created/updated from the JPA entities when the API starts.

3. **Build and run** from the **`blog/`** directory (the Maven module root):

   ```bash
   mvn spring-boot:run
   ```

   The API listens on **http://localhost:8080** by default, under **`/api/v1`**.

4. **IDE note:** MapStruct generates implementation classes (e.g. `PostMapperImpl`) during compilation. If the app fails with “bean … could not be found” for a mapper, run **`mvn compile`** once, or enable annotation processing / delegate the build to Maven in your IDE.

## Frontend setup

1. Install dependencies:

   ```bash
   cd blog-frontend
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

   Vite serves the UI (default **http://localhost:5173**) and **proxies** requests starting with `/api` to **http://localhost:8080**, so the browser can call the API without CORS configuration during development.

3. Production build (optional):

   ```bash
   npm run build
   npm run preview   # local preview of the built assets
   ```

   For production, serve the built `dist/` behind a reverse proxy and configure the same origin or CORS as appropriate for your API host.

## Using the application

1. Start the stack: **`docker compose up -d`** (database), then **`mvn spring-boot:run`** in `blog/`, then **`npm run dev`** in `blog-frontend/`.
2. Open the app in the browser. **Sign up** at **`/signup`** (or use **Log in** at `/login`). With the **`dev`** profile, a seed user is still created on startup (see `DevUserSeedRunner` and `dev.seed-user.*` in `application.properties`).
3. Create categories, tags, and posts as needed.
4. Optional: open **Adminer** at **http://localhost:8888**, select **PostgreSQL**, then connect as described in **Adminer** above.

### Verifying registration and auth

- **Register**: `POST /api/v1/auth/register` with JSON `{ "name", "email", "password" }` (password min 8 characters) → **201** and `{ "token", "expiresIn" }` (`expiresIn` is seconds, aligned with `jwt.expiration-ms`).
- **Duplicate email** → **400** with a clear message.
- **UI**: From the navbar, **Sign up** → submit the form → you should land on the home page already authenticated.

## API overview

REST endpoints are grouped under **`/api/v1`** (e.g. posts, categories, tags, auth). Auth endpoints include **`POST /api/v1/auth/login`** and **`POST /api/v1/auth/register`**. The React client uses **`/api/v1`** via the Vite proxy (`baseURL: '/api/v1'` in `blog-frontend/src/services/apiService.ts`).

---

## Deployment (free tier)

See **[DEPLOY.md](DEPLOY.md)** for hosting the API, Postgres, and the Vite app (e.g. Render + Neon + Vercel), including **CORS** and **`VITE_API_BASE_URL`**.

For frontend-only scripts and tooling details, see `blog-frontend/README.md` if present.

# Deploy this blog for free (typical setup)

You deploy **three pieces**: a **PostgreSQL** database, the **Spring Boot API**, and the **Vite/React** static site. All have solid free tiers; the API tier often **sleeps after idle** (first request after sleep may take ~30–60 seconds).

## 1. Database (free PostgreSQL)

Use a hosted Postgres instance and copy its **JDBC URL**, user, and password.

- **[Neon](https://neon.tech)** — free tier, good for serverless Postgres.
- **[Supabase](https://supabase.com)** — free tier includes Postgres.

Create a database (or use the default). You need something like:

- URL: `jdbc:postgresql://HOST:5432/DBNAME?sslmode=require`
- Username / password from the provider.

## 2. Backend API (example: Render)

1. Push this repo to **GitHub**.
2. In **[Render](https://render.com)** create a **Web Service** from that repo.
3. **Runtime**: Docker (or Native with Java 21 — if using Docker, the `Dockerfile` at the repo root is used when the service root is the folder containing `pom.xml`).
4. **Root directory**: the Maven project folder (the one with `pom.xml` and `Dockerfile`).
5. **Environment variables** (names are important):

| Variable | Example / notes |
|----------|------------------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://...?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | from Neon/Supabase |
| `SPRING_DATASOURCE_PASSWORD` | from Neon/Supabase |
| `JWT_SECRET` | Long random string (at least 32 bytes); **never commit it** |
| `APP_CORS_ALLOWED_ORIGINS` | Your **frontend** URL only, e.g. `https://your-app.vercel.app` (no trailing slash). For multiple origins, comma-separate. |

6. After deploy, note the public URL, e.g. `https://your-api.onrender.com`.

Spring Boot maps environment variables to properties: `APP_CORS_ALLOWED_ORIGINS` → `app.cors.allowed-origins`.

**Security:** Do not rely on default `jwt.secret` or datasource defaults in production. Always set `JWT_SECRET` and datasource variables on the host. If real passwords or keys were ever committed to Git, **rotate them** and scrub history (e.g. `git filter-repo`) or treat those credentials as compromised.

## 3. Frontend (example: Vercel)

1. In **[Vercel](https://vercel.com)** import the same GitHub repo.
2. **Root directory**: `blog-frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. **Environment variable** (must be set **before** build so Vite can embed it):

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | Full API base path, e.g. `https://your-api.onrender.com/api/v1` |

6. Redeploy after changing `VITE_API_BASE_URL`.

**Netlify / Cloudflare Pages:** Same idea: build `blog-frontend`, publish `dist`, set `VITE_API_BASE_URL` in the project’s environment.

## 4. Local vs production

- **Local:** `npm run dev` keeps `VITE_API_BASE_URL` unset so Axios uses `/api/v1` and the Vite proxy talks to `localhost:8080`.
- **Production:** The browser calls the **absolute** API URL; CORS must list your **exact** frontend origin (`APP_CORS_ALLOWED_ORIGINS`).

## 5. Smoke test

1. Open the deployed frontend, **Sign up** a user.
2. Create a category/tag/post if needed.
3. If the UI loads but API calls fail: check browser **Network** tab (CORS errors → fix `APP_CORS_ALLOWED_ORIGINS`), and confirm `VITE_API_BASE_URL` matches your API including `/api/v1`.

## Alternatives

- **Fly.io**, **Railway**, **Google Cloud Run** (free tier / credits) can run the JAR or Docker image similarly; set the same env vars.
- **Single-origin** deploy (API + static files behind one nginx, or Spring serving `dist/`) avoids CORS but needs more setup; the split above is the simplest path on free static hosts.

# Deploy this blog for free (typical setup)

You deploy **three pieces**: a **PostgreSQL** database, the **Spring Boot API**, and the **Vite/React** static site. All have solid free tiers; the API tier often **sleeps after idle** (first request after sleep may take ~30–60 seconds).

---

## Automated: Render Blueprint (`render.yaml`)

This repo includes **[render.yaml](render.yaml)** so you can provision **both** the Docker API and the static frontend on **[Render](https://render.com)** in one flow.

1. Create a **PostgreSQL** database elsewhere (**[Neon](https://neon.tech)** or **[Supabase](https://supabase.com)**) and copy the JDBC URL, username, and password.
2. In Render: **New → Blueprint** → connect your GitHub repo (**[Blog-Application](https://github.com/naveenr03/Blog-Application)** or your fork).
3. When prompted, set the **sync: false** variables:
   - **API service (`blog-api`):** `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `APP_CORS_ALLOWED_ORIGINS`
   - **Static site (`blog-frontend`):** `VITE_API_BASE_URL`
4. **First-time tip:** You may not know the final URLs until after the first deploy. Options:
   - Deploy once with placeholder CORS/API URL, then open each service’s **`.onrender.com`** URL from the dashboard, set **`APP_CORS_ALLOWED_ORIGINS`** to the **frontend** URL (no trailing slash) and **`VITE_API_BASE_URL`** to **`https://<blog-api-host>/api/v1`**, then **Manual Deploy → Clear build cache & deploy** on the static site (and update the API if CORS changed).
5. **`JWT_SECRET`** is **auto-generated** by Render on first create (`generateValue: true`). To rotate it later, set it manually in the service **Environment** tab.

The static site includes a **SPA rewrite** (`/*` → `/index.html`) so React Router deep links work.

---

## Automated: Vercel (frontend only)

If the API is already hosted (e.g. on Render), you can deploy only the UI to **[Vercel](https://vercel.com)**:

1. **New Project** → import the repo.
2. **Root Directory:** `blog-frontend` (Vercel picks up [blog-frontend/vercel.json](blog-frontend/vercel.json): Vite build + SPA rewrites).
3. Add **`VITE_API_BASE_URL`** = `https://your-api-host/api/v1` and deploy.
4. Set **`APP_CORS_ALLOWED_ORIGINS`** on the API to your **Vercel** origin (e.g. `https://your-app.vercel.app`).

---

## Manual steps (same as Blueprint, without `render.yaml`)

### 1. Database (free PostgreSQL)

Use a hosted Postgres instance and copy its **JDBC URL**, user, and password.

- **[Neon](https://neon.tech)** — free tier, good for serverless Postgres.
- **[Supabase](https://supabase.com)** — free tier includes Postgres.

Create a database (or use the default). You need something like:

- URL: `jdbc:postgresql://HOST:5432/DBNAME?sslmode=require`
- Username / password from the provider.

### 2. Backend API (Render, manual Web Service)

1. Push this repo to **GitHub**.
2. In **[Render](https://render.com)** create a **Web Service** from that repo.
3. **Runtime**: Docker; **root** = folder with `pom.xml` and `Dockerfile`.
4. **Environment variables** (names are important):

| Variable | Example / notes |
|----------|------------------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://...?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | from Neon/Supabase |
| `SPRING_DATASOURCE_PASSWORD` | from Neon/Supabase |
| `JWT_SECRET` | Long random string (at least 32 bytes); **never commit it** |
| `APP_CORS_ALLOWED_ORIGINS` | Your **frontend** URL only, e.g. `https://your-app.vercel.app` (no trailing slash). For multiple origins, comma-separate. |

5. After deploy, note the public URL, e.g. `https://your-api.onrender.com`.

Spring Boot maps environment variables to properties: `APP_CORS_ALLOWED_ORIGINS` → `app.cors.allowed-origins`.

**Security:** Do not rely on default `jwt.secret` or datasource defaults in production. Always set `JWT_SECRET` and datasource variables on the host. If real passwords or keys were ever committed to Git, **rotate them** and scrub history (e.g. `git filter-repo`) or treat those credentials as compromised.

### 3. Frontend (Vercel or Render static)

- **Vercel:** root `blog-frontend`, env `VITE_API_BASE_URL` (see above).
- **Render static:** same as in `render.yaml` — **no** `rootDir` (repo root), `cd blog-frontend && npm ci && npm run build`, **`staticPublishPath: ./blog-frontend/dist`** (repo-relative; matches Vite’s `dist/`). If the dashboard **Root Directory** is set to `blog-frontend`, clear it or the `cd` step will fail; alternatively keep `rootDir` and use **`staticPublishPath: ./dist`** only.

### 4. Local vs production

- **Local:** `npm run dev` keeps `VITE_API_BASE_URL` unset so Axios uses `/api/v1` and the Vite proxy talks to `localhost:8080`.
- **Production:** The browser calls the **absolute** API URL; CORS must list your **exact** frontend origin (`APP_CORS_ALLOWED_ORIGINS`).

### 5. Smoke test

1. Open the deployed frontend, **Sign up** a user.
2. Create a category/tag/post if needed.
3. If the UI loads but API calls fail: check browser **Network** tab (CORS errors → fix `APP_CORS_ALLOWED_ORIGINS`), and confirm `VITE_API_BASE_URL` matches your API including `/api/v1`.

## Alternatives

- **Fly.io**, **Railway**, **Google Cloud Run** (free tier / credits) can run the JAR or Docker image similarly; set the same env vars.
- **Single-origin** deploy (API + static files behind one nginx, or Spring serving `dist/`) avoids CORS but needs more setup; the split above is the simplest path on free static hosts.

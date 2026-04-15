# Frontend reference — React journal SPA

This document describes the `blog-frontend/` implementation (Vite + React + TypeScript) for reuse as a template. Paths are relative to `blog-frontend/` unless noted.

---

## 1. Technology stack

| Area | Choice |
|------|--------|
| Build | Vite 5 |
| UI | React 18, TypeScript |
| Styling | Tailwind CSS 3 + PostCSS |
| Components | NextUI (`@nextui-org/react`) |
| HTTP | Axios (singleton service) |
| Routing | React Router 7 |
| Rich text | TipTap (`@tiptap/react`, `@tiptap/starter-kit`) |
| Calendar | `react-day-picker` v9 |
| Dates | `date-fns` |
| HTML sanitization | DOMPurify (e.g. post body rendering) |
| Icons | `lucide-react` |

---

## 2. Project structure

```
blog-frontend/
├── index.html
├── vite.config.ts          # dev proxy /api → backend, manualChunks
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.tsx            # React root, NextUI provider, global layout shell
    ├── App.tsx             # Router, AuthProvider, ProtectedRoute, routes
    ├── index.css           # global + Tailwind
    ├── components/
    │   ├── AuthContext.tsx # JWT + user in localStorage, axios defaults
    │   ├── NavBar.tsx      # nav, search → URL, user menu
    │   ├── PostList.tsx
    │   └── PostForm.tsx    # create/edit (TipTap, category/tag pickers)
    ├── pages/
    │   ├── HomePage.tsx    # journal: calendar + filters + PostList
    │   ├── LoginPage.tsx, SignupPage.tsx
    │   ├── PostPage.tsx, EditPostPage.tsx, DraftsPage.tsx
    │   ├── CategoriesPage.tsx, TagsPage.tsx
    └── services/
        └── apiService.ts   # all REST calls, types, Axios instance
```

---

## 3. Environment and API base URL

- **`VITE_API_BASE_URL`**: in production, set to the **full API root including `/api/v1`**, e.g. `https://your-api.onrender.com/api/v1`.
- If unset, the client defaults to **`/api/v1`** (relative URL).

**Local development**

- `vite.config.ts` proxies **`/api`** → `http://localhost:8080`, so the browser calls `/api/v1/...` and Vite forwards to the Spring Boot app.

```ts
// apiService.ts (conceptual)
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1';
```

---

## 4. Authentication model

### 4.1 Storage

- **`localStorage.token`**: JWT string.
- **`localStorage.user`**: JSON `{ id, name, email }` for UI.

### 4.2 `AuthProvider` (`components/AuthContext.tsx`)

- **Initial state is read synchronously** from `localStorage` (lazy `useState` initializers) so on **full page refresh** `ProtectedRoute` does not redirect to login before effects run.
- **`applyAuthResponse`**: writes token + user JSON, updates React state.
- **`useEffect` on `token`**: sets `axios.defaults.headers.common['Authorization'] = Bearer …` on the shared Axios instance inside `ApiService`.

### 4.3 Protected routes (`App.tsx`)

- Wrapper reads `useAuth().isAuthenticated`; if false, **`Navigate` to `/login`**.
- All journal/post/category/tag routes are wrapped; login/signup are public.

### 4.4 API calls

- `apiService` request interceptor attaches `Bearer` from `localStorage` on each request (defense in depth alongside defaults).

---

## 5. HTTP layer (`services/apiService.ts`)

- **Singleton class** `ApiService` with private constructor; export **`apiService`** instance.
- **Types**: `Post`, `Category`, `Tag`, `AuthResponse`, `CreatePostRequest`, journal calendar types, etc. — aligned with backend JSON (field naming such as `categoryId` mapped to backend `categoryID` in query params where needed).
- **Methods**: `login`, `register`, `getPosts`, `getPost`, `createPost`, `updatePost`, `deletePost`, `getDrafts`, `getJournalCalendar`, `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`, `getTags`, `createTags`, `deleteTag`.

**Pattern for next project**: keep all backend URLs and DTO shapes in one module; components stay thin.

---

## 6. Routing (`App.tsx`)

| Path | Page | Protection |
|------|------|------------|
| `/` | `HomePage` | Protected |
| `/login`, `/signup` | Login, Signup | Public |
| `/posts/new`, `/posts/:id`, `/posts/:id/edit`, `/posts/drafts` | Editor / reader / drafts | Protected |
| `/categories`, `/tags` | Manage labels; names link back to journal with query params | Protected |

`NavBar` provides **Journal**, **Categories**, **Tags**, search, drafts shortcut, new post.

---

## 7. Journal home (`pages/HomePage.tsx`)

### 7.1 URL as source of truth

Search params drive filters and avoid losing state on refresh:

| Param | Meaning |
|-------|---------|
| `q` | Search text (also used from NavBar) |
| `categoryId` | Filter by category UUID |
| `tagId` | Filter by tag UUID |
| `date` | `yyyy-MM-dd` — when set, **day mode** |

### 7.2 Browse vs day mode

- **Browse mode**: `(categoryId OR tagId)` **and** **no** `date` → `getPosts` is called **without** `entryDate` so the API returns **all matching entries** across days (for “see everything in this category/tag”).
- **Day mode**: default listing for “today” when no `date`; or when `date` is set — passes **`entryDate`** to the API for that calendar day.

Calendar **day selection** writes `date` into the query string so bookmarking and sharing preserve the day scope.

### 7.3 Data loading

- Parallel fetch: posts (with params), categories, tags.
- **Month calendar hints**: `getJournalCalendar(year, month)` to dot days that have entries.

### 7.4 UX copy

- Header explains journal + filters; list caption switches between “Showing all entries …” (browse) and “Showing entries for &lt;date&gt; …” (day).

---

## 8. Categories and tags pages

- **Your categories / Your tags** — table with **name as `Link`** to `/?categoryId=…` or `/?tagId=…` for drill-down.
- CRUD uses `apiService`; pages assume user is logged in (route already protected).

---

## 9. Post editing and reading

- **`PostForm`**: TipTap editor, category dropdown, tags, status, optional `entryDate` (from query on new entry).
- **`PostPage`**: loads single post, DOMPurify for HTML body, chips for category/tags, edit/delete for owner session; **serif** font class on body for a journal feel.

---

## 10. NavBar search

- On path `/`, submitting search **merges** `q` into existing `searchParams` so category/tag/date filters are preserved.
- From other pages, search navigates to `/?q=…`.

---

## 11. Build and deploy

```bash
cd blog-frontend
npm ci
npm run build
```

Output: `dist/` static files. Any static host (Render static site, Vercel, Netlify, S3) works.

**Required env at build time for production**

- `VITE_API_BASE_URL=https://<api-host>/api/v1`

Vite inlines `import.meta.env.VITE_*` at build time — changing the API URL requires a **rebuild**.

---

## 12. Patterns to reuse in the next project

1. **Single `apiService` + TypeScript types** shared across pages.
2. **AuthContext** with **sync hydration** from `localStorage` to avoid refresh → login redirect bug.
3. **Protected routes** + centralized layout (`NavBar`).
4. **Journal filters in the URL** (`useSearchParams`) for shareable and refresh-safe state.
5. **Browse vs detail scope** (omit `entryDate` when browsing by label only).
6. **Vite proxy** in dev so the SPA can always use `/api/v1` without CORS during local work; **CORS** on the API for production cross-origin.
7. **Code splitting** in `vite.config.ts` (`manualChunks`) for vendor/editor/ui bundles.

---

## 13. Relationship to the backend

- Backend is **JWT + REST**; this SPA has **no server-side rendering**.
- All private data assumes **one user per browser session**; multi-tenant UI is not the focus — the API still enforces **per-user** data for categories/tags/posts.

For API details (status codes, query names, auth header), see **`docs/BACKEND_REFERENCE.md`** in the same repository.

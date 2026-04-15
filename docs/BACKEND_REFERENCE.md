# Backend reference — Spring Boot journal / blog API

This document describes the Java/Spring Boot implementation so you can reuse patterns in another project. Paths are relative to the repository root (`blog/`).

---

## 1. Technology stack

| Layer | Choice |
|--------|--------|
| Runtime | Java 21 |
| Framework | Spring Boot 4.x |
| Web | Spring Web MVC (`spring-boot-starter-webmvc`) |
| Persistence | Spring Data JPA + Hibernate |
| Database | PostgreSQL (production); H2 for tests |
| Migrations | Flyway (`spring-boot-starter-flyway` + `flyway-database-postgresql`) |
| Security | Spring Security, stateless JWT |
| Mapping | MapStruct |
| Build | Maven (`pom.xml`) |

---

## 2. Project layout (`src/main/java/com/project/blog/`)

| Package / area | Responsibility |
|----------------|----------------|
| `BlogApplication.java` | Spring Boot entry point |
| `config/` | Security, CORS, Jackson, optional `CommandLineRunner` seeds/backfill |
| `controllers/` | REST endpoints (`@RestController`), JSON in/out |
| `domain/` | Non-entity request objects (`CreatePostRequest`, `UpdatePostRequest`, enums like `PostStatus`) |
| `domain/dtos/` | API DTOs (JSON shapes for requests/responses) |
| `domain/entities/` | JPA entities (`User`, `Post`, `Category`, `Tag`) |
| `mappers/` | MapStruct interfaces (entity ↔ DTO) |
| `repositories/` | Spring Data JPA repositories + `PostSpecifications` (Criteria API) |
| `security/` | `JwtAuthenticationFilter`, `BlogUserDetails`, `BlogUserDetailsService` |
| `services/` + `services/impl/` | Business logic, transactions |

Resources live under `src/main/resources/`:

- `application.properties` — default (often local dev)
- `application-prod.properties` — production overrides (`spring.profiles.active=prod`)
- `db/migration/` — Flyway SQL (e.g. `V1__categories_tags_owner_id.sql`)

---

## 3. Configuration highlights

### 3.1 Data source & JPA

- JDBC URL, user, password via `SPRING_DATASOURCE_*` (or local defaults in `application.properties`).
- `spring.jpa.hibernate.ddl-auto=update` in default profile: Hibernate updates the schema in dev; **production should rely on Flyway** for structural changes; `ddl-auto` can remain `update` or be switched to `validate` once migrations own the schema.

### 3.2 JWT

- `jwt.secret` — strong secret in production (`JWT_SECRET` env).
- `jwt.expiration-ms` — token lifetime; `AuthResponse.expiresIn` (seconds) should stay aligned (see `AuthController`).

### 3.3 CORS

- `app.cors.allowed-origins` — comma-separated SPA origins; set `APP_CORS_ALLOWED_ORIGINS` in production so the browser can call the API from a different host.

### 3.4 Production profile (`application-prod.properties`)

- Disables verbose SQL logging.
- Flyway: `baseline-on-migrate=true`, `baseline-version=0` so an **existing** non-empty database without `flyway_schema_history` can baseline at 0 and then apply **`V1`** (if `baseline-version` were left at default `1`, **`V1` could be skipped** because it is also version 1).
- **`flyway-database-postgresql`** is required on the classpath for Flyway 10+ against PostgreSQL (otherwise `Unsupported Database`).

### 3.5 Tests

- `src/test/resources/application.properties` uses H2 in-memory, **`spring.flyway.enabled=false`**, and `ddl-auto=create-drop` so tests do not run PostgreSQL-specific Flyway scripts.
- **CI:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs `mvn -B verify` and the frontend `npm ci`, `npm run lint`, `npm run build`.
- **Examples in this repo:** `@WebMvcTest` for `AuthController` (JSON contracts; security auto-config excluded for that slice), `@SpringBootTest` + `@AutoConfigureMockMvc` in `PostControllerMockMvcIntegrationTest` for `GET /api/v1/posts` (real `SecurityFilterChain`: 401 without auth, 200 with mocked services), `@DataJpaTest` for `UserRepository`.
- Test-only dependency: **`spring-security-test`** (MockMvc security request post-processors).

---

## 4. Domain model (entities)

### 4.1 `User`

- `id` (UUID), `email` (unique), `password` (hashed), `name`, `createdAt`.
- One-to-many: `posts`.

### 4.2 `Post`

- `id`, `Title`, `content`, `status` (`DRAFT` / `PUBLISHED`), `readingTime`, `author`, `category`, `tags` (many-to-many via `post_tags`), `entryDate` (journal day), `createdAt`, `updatedAt`.
- **All journal listing for the SPA is scoped by authenticated author** in `PostService`, not by making posts public.

### 4.3 `Category` and `Tag` (per-user ownership)

- Each has a **`User owner`** (`owner_id` FK) and **`(owner_id, name)` unique** — names are unique per user, not globally.
- Categories: one-to-many with posts (`category_id` on `posts`).
- Tags: many-to-many with posts through `post_tags`.

### 4.4 Why Flyway `V1` exists

Older deployments had `categories` / `tags` without `owner_id`. Migration `V1__categories_tags_owner_id.sql`:

- Adds `owner_id`, backfills from posts (one author per category/tag via `DISTINCT ON` — avoids **`min(uuid)`** which is not available in all PostgreSQL configurations), falls back to a single user for orphans, drops legacy unique-on-`name`-only constraints, adds FKs and composite uniques.
- Wrapped in `DO $$ ... $$` with guards so it no-ops if columns already exist or tables are missing (fresh DB created by Hibernate first).

---

## 5. Repositories

- **`PostRepository`**: `JpaRepository<Post, UUID>` + **`JpaSpecificationExecutor<Post>`** for dynamic filters.
- **`PostSpecifications`**: Criteria API predicates for “author + optional category, tag, entry date, search text”. Used instead of JPQL like `(:x IS NULL OR field = :x)` because **PostgreSQL** can throw `could not determine data type of parameter` for those patterns.
- **`CategoryRepository` / `TagRepository`**: queries scoped by **`owner`** (e.g. `findAllByOwnerFetchPosts`, `findByIdAndOwner_Id`, `findByOwnerAndNameIn`).

---

## 6. Services (patterns)

- **Controllers** resolve `BlogUserDetails` → `User` via `UserService.getUserById(principal.getId())` where needed.
- **`CategoryService` / `TagService`**: every list/create/update/delete takes the current **`User`**; `getCategoryById` / `getTagById` / `getTagByIds` enforce ownership so another user’s UUIDs cannot be attached to posts.
- **`PostServiceImpl`**: `getAllPosts` loads optional category/tag **for that author only**; create/update validates category and tags belong to the same user as the post.
- **`AuthenticationService`**: login token generation/validation (JWT).
- **`UserService`**: registration, `getUserById`.

---

## 7. REST API surface (prefix `/api/v1`)

| Area | Methods | Notes |
|------|---------|--------|
| **Auth** `/auth` | `POST /login`, `POST /register` | **PermitAll**; returns JWT + user fields in `AuthResponse`. |
| **Posts** `/posts` | `GET` (query: `categoryID`, `tagID`, `search`, `entryDate`), `GET /drafts`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` | Authenticated; list is **author-scoped**. |
| **Categories** `/categories` | `GET`, `POST`, `PUT /{id}`, `DELETE /{id}` | Authenticated; data scoped to principal. |
| **Tags** `/tags` | `GET`, `POST`, `DELETE /{id}` | Same. |
| **Journal** `/journal` | `GET /calendar?year&month` | Month calendar hints for the journal UI. |

Spring maps JSON field names from DTOs; query params sometimes use `categoryID` / `tagID` (see `PostController`).

---

## 8. Security architecture

- **Stateless**: `SessionCreationPolicy.STATELESS`, no server-side sessions.
- **JWT filter**: `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`, validates via `AuthenticationService`, sets `SecurityContext`.
- **Passwords**: `PasswordEncoderFactories.createDelegatingPasswordEncoder()` (supports `{bcrypt}...` prefixes).
- **Authorization**: `SecurityConfig` — only login/register are anonymous; typical pattern is **authenticated** for reads/writes on posts/categories/tags/journal (this app is private journal style).

Invalid/expired tokens: filter logs and continues without authentication; protected endpoints then return **401** via `authenticationEntryPoint`.

---

## 9. DTOs and MapStruct

- Request bodies use `*Request` / `*RequestDto` classes with Jakarta Validation where needed.
- `PostMapper`, `CategoryMapper`, `TagMapper` convert entities ↔ DTOs. Category DTO may compute **published** post counts from the `posts` collection — repositories that fetch categories for listing use **`LEFT JOIN FETCH`** where needed so counts are correct.

---

## 10. Error handling

- `ErrorController` (or `@ControllerAdvice` if present) centralizes uncaught exceptions and returns JSON (`ApiErrorResponse`) for API clients.

---

## 11. Operational checklist for a new deployment

1. PostgreSQL reachable; env: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `SPRING_PROFILES_ACTIVE=prod`, `APP_CORS_ALLOWED_ORIGINS`.
2. Ensure **`flyway-database-postgresql`** is on the classpath (see `pom.xml`).
3. First boot: Flyway runs **`V1`** on legacy DBs; verify `owner_id` on `categories` and `tags`.
4. If migration fails once, fix SQL and redeploy; if Flyway history is inconsistent, use **`flyway repair`** or clean failed rows per Flyway docs — avoid hand-editing unless you know the implications.

---

## 12. Files worth copying as templates

- `SecurityConfig.java` + `JwtAuthenticationFilter.java` + `AuthenticationService` implementation pattern.
- `PostSpecifications.java` + `PostRepository` + `PostServiceImpl.getAllPosts` for **safe optional filters on PostgreSQL**.
- `V1__categories_tags_owner_id.sql` as a **pattern** for additive, idempotent schema upgrades.
- `application-prod.properties` Flyway baseline settings for **existing** databases.

This backend is intentionally **monolithic**: one deployable JAR, one database, JWT for SPA authentication, and Flyway for schema evolution.

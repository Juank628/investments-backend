# node-backend-template

Base Express + TypeScript backend template: cookie-based JWT auth with `admin` / `editor` / `viewer` roles, plus a single protected `GET /diagnostic` endpoint used as a reference for adding new endpoints later.

## Stack

- Node.js >= 24, TypeScript 5.9
- Express 5
- Sequelize + PostgreSQL
- JWT stored in an `httpOnly` cookie (not a bearer header)

## Using this template

1. Clone/copy this repo as the starting point for the new project and update `name`/`description` in `package.json`.
2. Point `DATABASE_PUBLIC_URL` at the new project's own Postgres database — don't reuse another project's database.
3. Follow **Setup** below to install, seed the first admin, and run it.
4. Follow the `diagnostic` pattern (see **Adding new endpoints**) to build out real endpoints.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values:
   - `DATABASE_PUBLIC_URL` — Postgres connection string for this app's database.
   - `JWT_PRIVATE_KEY` — any long random string, used to sign/verify auth cookies.
   - `CORS_ORIGIN` — the URL of the frontend that will call this API with credentials.
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — credentials for the first admin user (`SEED_ADMIN_PASSWORD` needs 8+ characters with upper/lowercase, a number, and a special character).
3. `npm run seed` — creates the tables (if they don't exist yet) and the first admin user. This account is the only one that can create further users (`POST /users-admin/create-user`), so treat its password as a real credential, not a throwaway. `npm run unseed` removes it by email if you ever need to reset and reseed.
4. `npm run dev` — starts the API on `http://localhost:3500` with auto-reload.

Table sync isn't automatic on every server start — run `npm run db:sync` on its own after you add or change a model.

## Auth model

- `POST /users/login` checks the credentials and, on success, sets an `httpOnly` `access_token` cookie containing a JWT with the user's `email` and `role`. There is no token in the response body — the cookie is the credential.
- Every route mounted after `getTokenPayload` in `app.ts` (currently `/users-admin` and `/diagnostic`) requires that cookie. Missing or invalid tokens get `401`.
- Individual routes additionally gate by role with `verifyRoles([...])`; a valid token with the wrong role gets `403`.
- 3 failed login attempts blocks the user (`blocked: true` in the DB); a successful login resets the counter.
- Because auth is cookie-based, callers must send credentials with each request — `curl -b/-c cookie.txt`, or `fetch(url, { credentials: "include" })` from a browser with `CORS_ORIGIN` set to that frontend's origin.

## Try it

Log in as the seeded admin — this stores the auth cookie in `cookie.txt`:

```sh
curl -c cookie.txt -X POST http://localhost:3500/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<SEED_ADMIN_EMAIL>","password":"<SEED_ADMIN_PASSWORD>"}'
```

Use that cookie to call the protected diagnostic endpoint:

```sh
curl -b cookie.txt http://localhost:3500/diagnostic
```

```json
{ "status": "up", "timestamp": "2026-08-26T12:00:00.000Z" }
```

A request without a valid cookie is rejected before it reaches the route:

```sh
curl http://localhost:3500/diagnostic
# {"error":"No token provided"}
```

## Endpoints

| Method | Path                       | Auth                  | Purpose                                     |
| ------ | --------------------------- | ---------------------- | -------------------------------------------- |
| POST   | `/users/login`               | none                    | Log in, sets the `access_token` cookie       |
| POST   | `/users-admin/create-user`   | cookie, role `admin`    | Create a new user (no role assigned yet)     |
| GET    | `/diagnostic`                | cookie, any role        | Health/reference endpoint, returns `status`/`timestamp` |

New users created via `create-user` have no `role` until an admin assigns one directly in the database — they can't log in until they do.

## Project structure

```
src/
  app.ts              Express app + route mounting
  controllers/         Request handlers
  routes/               Route definitions (mounted in app.ts)
  middlewares/          getTokenPayload (auth), verifyRoles (authorization)
  models/               Sequelize models
  services/              db.ts (Sequelize instance), synch.ts (table sync)
  scripts/               seed.ts / unseed.ts / sync.ts (run via npm scripts, not mounted in the app)
```

`tsc` builds `src/` into `dist/` with the same shape; `dist/` is gitignored and rebuilt by `npm run build`.

## Adding new endpoints

Follow the `diagnostic` pattern: model (if needed) → controller → route → mount in `src/app.ts` → gate with `verifyRoles([...])`. If you add a model, add its import to `src/services/synch.ts` and run `npm run db:sync`.

## Scripts

| Command             | Purpose                                              |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`         | Run the API with auto-reload (`ts-node` + `nodemon`)   |
| `npm run build`       | Compile `src/` to `dist/`                              |
| `npm start`           | Run the compiled app from `dist/` (production)          |
| `npm run watch`       | `tsc -w`, recompiles on change without running the app |
| `npm run db:sync`     | Sync Sequelize models to the database schema           |
| `npm run seed`        | Create the first admin user                             |
| `npm run unseed`      | Remove the seeded admin user                             |
| `npm run lint` / `lint:fix` | Lint `src/`                                       |
| `npm run format`      | Format `src/` with Prettier                             |

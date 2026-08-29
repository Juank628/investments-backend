---
name: generate-crud-endpoint
description: Scaffold a fully wired REST endpoint (controller + route + app.ts registration) in this backend application Express/Sequelize API, given a path to a Sequelize model and a map of which HTTP methods to implement with which user roles (e.g. GET:[admin,viewer], POST:[admin]). Use this any time the user asks to create, add, scaffold, expose, or wire up an endpoint, API route, or CRUD operations for a Sequelize model in this repo — including requests like "add an endpoint for the X model" or "expose Y over the API" — even if they don't mention "skill" or provide every detail up front. Do not use it for non-Sequelize routes or for editing an already-existing controller/route pair by hand.
---

# Generate CRUD endpoint

Scaffolds a REST endpoint for one Sequelize model in this repo, matching
this repo's established controller-route-app.ts pattern exactly. See
`references/conventions.md` for the full worked example (field selection
rules, status codes, naming) — read it before writing any code, it has all
the detail this file intentionally leaves out.

## Required inputs

1. **Model path** — e.g. `src/models/Product.ts`.
2. **Methods to implement, each with its allowed roles** — e.g.
   `GET: [admin, viewer, editor], POST: [admin], PUT: [admin], DELETE: [admin]`.

If either is missing or a method's role list is empty/unclear, ask before
writing code — getting a role list wrong is a security mistake, not a style
one, so don't guess it.

Only implement the methods actually given. Don't add a method "for
completeness" — an omitted method means the developer doesn't want it yet.

## Workflow

1. **Read the model file.** Note: the exported model variable name, the
   `I<Model>` interface, every field's type/`allowNull`/`defaultValue`, and
   which field is `primaryKey: true`. This drives naming and body validation
   — see `references/conventions.md` for the exact rules.

2. **Derive the resource base name.** Pluralized camelCase of the model
   name (e.g. `Product` → `products`) — see `references/conventions.md`
   for the exact pluralization/kebab-casing rule and a multi-word example.
   This is the shared base for the controller filename, route filename,
   and (kebab-cased) URL path. If pluralization is awkward or ambiguous,
   ask rather than guess.

3. **Write `src/controllers/<base>.types.ts`** (only if POST and/or PUT is
   requested) with request-body interfaces, following this repo's existing
   controller-types style. See the reference for exactly which fields are
   required vs. optional vs. excluded.

4. **Write `src/controllers/<base>.ts`** with only the requested handlers
   (`getAll<Model>s`, `get<Model>ById`, `create<Model>`, `update<Model>`,
   `delete<Model>`), mirroring this repo's existing controller style: async
   `(req, res, next)`, 422 on missing required body fields (with the same
   `{ error, details }` shape), 404 when a row isn't found, try/catch around
   DB calls calling `next(error)` on failure. Full status-code table is in
   the reference.

5. **Write `src/routes/<base>.ts`**, mirroring this repo's existing route
   files: one `router.<verb>(...)` per requested method, each wrapped in
   `verifyRoles([...roles])` using exactly the roles supplied for that
   method — nothing added, nothing dropped.

6. **Wire it into `src/app.ts`.** Add the route import alongside the other
   route imports, and add `app.use("/<kebab-base>", <base>Routes);` in the
   *protected* section (after `app.use(getTokenPayload)`), next to the
   other protected route registrations — every generated endpoint is
   role-gated, so it always belongs after that line, never before it.

7. **Format everything you touched.** Run `npx prettier --write` and
   `npx eslint --fix` scoped to exactly the files this task changed — the
   new controller/route/types files plus `app.ts` — not the whole-tree
   `npm run format` / `npm run lint:fix`, which glob all of `src/**/*.ts`
   and would reformat unrelated files that have nothing to do with this
   endpoint.

8. **Typecheck.** Run `npm run build` (this repo's `tsc --noEmit`
   equivalent — it also writes to `dist/`, that's fine, it's gitignored) to
   confirm zero TypeScript errors — that's the actual bar for "done" here,
   not a clean lint pass. Fix anything the build reports before finishing.

## Explicitly out of scope

Per the standing instructions for this skill: don't write tests, don't run
`db:sync`/create tables, and don't try to start the server to hit the
endpoint — the developer creates the tables and tests manually. Your job
ends at "code compiles cleanly and follows the existing patterns."

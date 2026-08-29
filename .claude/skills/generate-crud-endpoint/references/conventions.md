# Conventions for generated endpoints

This repo already has established controller/route pairs under
`src/controllers/` and `src/routes/`, wired into `src/app.ts`. Read at
least one existing pair before generating anything (if you haven't already
in this session) to confirm the rules below still match current code —
validation style, auth wiring, DB-lookup style, error handling. The rules
here were derived from that pattern; treat the live code as the source of
truth if the two ever disagree.

## Naming

Given a model `Product` (`src/models/Product.ts`):

| Thing | Value |
|---|---|
| Resource base (pluralized camelCase) | `products` |
| Controller file | `src/controllers/products.ts` |
| Route file | `src/routes/products.ts` |
| Types file (only if POST/PUT requested) | `src/controllers/products.types.ts` |
| URL path in `app.ts` | `/products` |

For a multi-word model, e.g. `OrderItem`: resource base `orderItems`,
files `orderItems.ts`, URL path `/order-items`. Pluralization uses default
English rules (`+s`; `+es` after s/x/z/ch/sh; consonant+`y` → `ies`). The
URL path is always the kebab-case of the camelCase base.

The route param for single-resource routes (GET one / PUT / DELETE) is
always `:id`, **regardless of the model's actual primary-key column name**.
This keeps every route file looking identical and avoids leaking the PK
column name into the URL shape.

In the controller, read it as `const id = String(req.params.id);` — under
Express 5's types `req.params.id` is `string | string[]`, so passing it
straight into a regex or a typed helper is a compile error. Then query with
`where: { [primaryKeyFieldName]: id }`.

**If the PK column is `UUID`, validate the param before querying.** Postgres
rejects a malformed UUID with a database error, which `next(error)` turns
into a 500 with a stack trace (there's no error middleware). A malformed id
can't match any row, so return the normal 404 instead:

```ts
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// ...at the top of every :id handler
if (!UUID_REGEX.test(id)) {
  res.status(404).json({ error: '<Model> not found' });
  return;
}
```

For an integer PK, apply the same idea with a digits check; for a plain
string PK no guard is needed.

## Field selection (create/update bodies)

Walk the model's field definitions (skip nothing implicit — this repo's
models only declare real columns, no separate timestamp fields to worry
about). For each field:

- **Primary key with no `defaultValue`, type `UUID`**: don't put it in the
  create body type at all. Generate it server-side with
  `import { randomUUID } from "node:crypto"` and pass it into
  `Model.create({ id: randomUUID(), ...body })`.
- **Primary key that's a natural key** (a string PK the caller must supply
  themselves, e.g. an email or a code) or that has its own `defaultValue`:
  treat it like any other field per the rules below.
- **`allowNull: false` and no `defaultValue`** (and not the auto-generated
  PK case above): required in the create body. Missing → 422, matching this
  repo's existing missing-parameter shape.

  **Never test presence with `!field`.** `0` and `false` are legitimate
  values for numeric and boolean columns, and a falsy check rejects them
  with a bogus 422. Declare this helper at the top of the controller and
  use it for every required-field check:

  ```ts
  //0 and false are valid values, so only null/undefined/'' count as missing
  const isMissing = (value: unknown): boolean =>
    value === undefined || value === null || value === '';
  ```

  ```ts
  if (isMissing(<field>) || ...) {
    res.status(422).json({
      error: 'Missing required parameters',
      details: {
        <field>: isMissing(<field>) ? '<field> is required' : undefined,
        ...
      },
    });
    return;
  }
  ```
- **`allowNull: true` or has a `defaultValue`**: optional in the create
  body; pass through only if present.

For update (PUT), accept all non-PK fields as optional (partial update) —
don't re-run the required-field check from create; only validate that the
`:id` row exists (404 if not).

## Handler shapes and status codes

Match this repo's existing controllers' control flow: async
`(req, res, next)`, early returns after each `res.json(...)`, DB calls
wrapped in try/catch with `next(error)` in the catch (there's no custom
error middleware in `app.ts` today — that's fine, `next(error)` is still
the established pattern to follow, don't add error-handling middleware as
part of this task).

| Handler | Success | Not found | Notes |
|---|---|---|---|
| `getAll<Model>s` | `200`, JSON array from `Model.findAll()` | — | list, no pagination unless asked |
| `get<Model>ById` | `200`, JSON record from `Model.findOne({ where: { [pk]: id } })` | `404 { error: "<Model> not found" }` | guard the param format first (see Naming) |
| `create<Model>` | `201`, JSON of the created record | — | 422 on missing required fields (see above) |
| `update<Model>` | `200`, JSON of the updated record | `404 { error: "<Model> not found" }` | look up first, then `.update(body)` on the instance, or `findOne` + save |
| `delete<Model>` | `200 { message: "<Model> deleted successfully" }` | `404 { error: "<Model> not found" }` | look up first so you can 404 correctly, then `.destroy()` |

Only generate the handlers for methods actually requested — e.g. if the
input is `GET: [...], POST: [...]` with no PUT/DELETE, the controller has
exactly two exports and the route file has exactly two routes.

## Route file shape

```ts
import { Router } from "express";
import { verifyRoles } from "../middlewares/verifyRoles";
import {
  getAllProducts,
  getProductById,
  createProduct,
} from "../controllers/products";

const router: Router = Router();

router.get("/", verifyRoles(["admin", "editor", "viewer"]), getAllProducts);
router.get("/:id", verifyRoles(["admin", "editor", "viewer"]), getProductById);
router.post("/", verifyRoles(["admin"]), createProduct);

export default router;
```

Use exactly the role arrays supplied for each method — GET's list and
by-id routes share whatever role list was given for `GET`.

## app.ts wiring

```ts
import productsRoutes from "./routes/products";
// ...
app.use(getTokenPayload);
app.use("/some-existing-protected-route", someExistingRoutes);
app.use("/products", productsRoutes);
```

Always after `app.use(getTokenPayload)` — every generated endpoint is
role-gated via `verifyRoles`, so it belongs in the protected section,
alongside this repo's other protected route registrations.

## Style

Follow `.prettierrc` for every file you create or touch, `app.ts` included.
Run `npx prettier --write` and `npx eslint --fix` scoped to exactly the
files this task touched (the new controller/route/types files, plus
`app.ts`) — not the whole-tree `npm run format` / `npm run lint:fix`,
since those glob all of `src/**/*.ts` and would reformat unrelated files
that have nothing to do with this endpoint.

Finish with `npm run build` (safe to run — it only reads and emits to the
gitignored `dist/`, it doesn't rewrite `src/`) to confirm no TypeScript
errors.

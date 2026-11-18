# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Admin API contract

The web app uses the separately hosted API configured by `vercel.json`. To enable
the admin dashboard, the backend should enforce authorization on every admin
route and provide:

- `GET /me` with `{ "user": { "id": "...", "role": "admin" | "user" } }`.
- `GET /admin/users` with `{ "users": [...] }`. Each user includes `id`,
  `username`, `email`, `role`, `status` (`pending` or `approved`),
  `lastLoginAt` (ISO date or `null`), and `createdAt` (ISO date).
- `POST /admin/users` accepting `{ "username", "email", "password" }`. A user
  created by an admin should be approved immediately.
- `PATCH /admin/users/:id/approve` to approve a pending registration.
- `DELETE /admin/users/:id` to delete a user.

All admin endpoints must require an authenticated admin bearer token. Public
registrations should remain pending and be denied login until approved by an
admin (for example, return `403` with a clear approval message from `POST /login`).
Return `401` for expired/invalid sessions and `403` for authenticated users
without admin privileges. The backend should also prevent an admin from deleting
their own account or the last remaining admin.

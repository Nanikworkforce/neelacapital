# Neela Capital

Monorepo for Neela Capital Investments.

## Layout

- **Root** — main marketing website (`neelacapital.com`)
- **`Neela-Tenant-App-2/`** — tenant portal frontend (`/portal`, `/admin`, `/manager`)
- **`Neela-Tenant-App-2/backend/`** — Django API (deployed on Render)

## URLs

| Path | App |
|------|-----|
| `/` | Main website |
| `/portal` | Listings / tenant portal |
| `/admin` | Admin dashboard |
| `/manager` | Property manager dashboard |

## Deploy notes

- **Hostinger:** upload built `dist/` (main site) + `dist/portal/` (portal SPA)
- **Render:** uses `render.yaml` with `rootDir: Neela-Tenant-App-2/backend`
- Copy `Neela-Tenant-App-2/backend/.env.example` → `.env` (never commit real secrets)

# Neela Capital

Monorepo for Neela Capital Investments — **one backend** powers the whole product.

## Layout

- **Root** — main marketing website (`neelacapital.com`)
- **`Neela-Tenant-App-2/`** — portal frontend (`/portal`, `/admin`, `/manager`)
- **`Neela-Tenant-App-2/backend/`** — Django API on Render (shared by website + portal)

## Single backend

Canonical API: `https://neela-backend-96ia.onrender.com`

Used by main site (contact/inquiries, rentals), portal, admin, and manager.

## URLs

| Path | App |
|------|-----|
| `/` | Main website |
| `/portal` | Listings / tenant portal |
| `/admin` | Admin dashboard |
| `/manager` | Property manager dashboard |

## Deploy notes

- **Hostinger:** upload built `dist/` (main site) + `dist/portal/`
- **Render:** Root Directory = `Neela-Tenant-App-2/backend` — keep only **one** web service (`neela-backend-96ia`); suspend `neela-backend-dfmg`
- Set `DATABASE_URL` to Hostinger MySQL; `LANDLORD_EMAIL` / `ADMIN_EMAIL` = `info@neelacapital.com`

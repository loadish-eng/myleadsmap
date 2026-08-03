# MyLeadsMap

A lead-generation CRM: search local businesses via Google Places, plot them on a map, and track
each one through a sales pipeline. Fully self-hosted — no external backend-as-a-service required.

## Stack

- `frontend/` — React + Vite, served by nginx in production
- `backend/` — Node.js/Express + Prisma, PostgreSQL
- `docker-compose.yml` — runs the whole thing (Postgres, API, frontend) with one command

## Run it locally

1. Copy the env file and fill in real values:

   ```bash
   cp .env.example .env
   ```

   At minimum, set a strong `POSTGRES_PASSWORD`, a random `JWT_SECRET`, and
   `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` (your first admin login). Set
   `GOOGLE_MAPS_API_KEY` to a Google Maps/Places API key — this is the shared key used for
   premium-plan and admin searches (standard-plan users can instead supply their own key from
   their Profile page).

2. Start everything:

   ```bash
   docker compose up --build
   ```

   On first boot the backend applies Prisma migrations and creates the bootstrap admin account
   from your `.env`. The app is then available at `http://localhost:8080` (or whatever
   `FRONTEND_PORT` you set).

3. Log in as the bootstrap admin, then go to **Profile → Manage Users** to create accounts for
   anyone you want to give access to. There's no public self-registration — accounts are
   admin-provisioned only.

## Local development without Docker

Backend:

```bash
cd backend
npm install
cp .env.example .env   # point DATABASE_URL at a local Postgres
npm run prisma:migrate:dev
npm run dev             # http://localhost:3001
```

Frontend:

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to http://localhost:3001
```

## Exposing it to other people

`scripts/serve_via_tailscale_funnel.ps1` puts the running Compose stack on the public internet via
[Tailscale Funnel](https://tailscale.com/kb/1223/funnel) — no router port-forwarding, no domain, no
certificate management. Requires the `tailscale` CLI installed and logged in
(`tailscale up`) and Funnel enabled for your tailnet
(`https://login.tailscale.com/admin/machines`, in your device's Funnel settings).

```bash
# from a PowerShell prompt, after `docker compose up -d`
./scripts/serve_via_tailscale_funnel.ps1
```

Run it with `-Stop` to remove the funnel mapping, or `-Status` to check the current mapping.

## Notes on scope

- **Plans**: `standard`/`premium` are still enforced (lead limits, who supplies the Google API
  key), but there's no real payment processing — an admin sets a user's plan from the Manage
  Users screen.
- **Data isolation**: each user only sees their own leads.
- **Password resets**: there's no outbound email, so self-service "forgot password" isn't
  available — an admin resets a user's password from Manage Users instead.

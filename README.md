# Saath

Saath is a private, shared wedding-planning workspace for couples and their families. It follows the product and architecture documents in [`doc/`](./doc): a Next.js modular monolith, MongoDB Atlas tenant data, and private Cloudflare R2 media storage.

## What this scaffold includes

- Next.js App Router with TypeScript and responsive dashboard/event starter screens.
- Versioned REST API foundation at `/api/v1`, including a health route and event list/create routes.
- Shared Zod request validation and the documented JSON error envelope.
- MongoDB connection module, tenant membership authorization seam, event repository, and an index setup script based on `DATABASE-DESIGN.md`.
- Feature-oriented folders ready for weddings, guests, invitations, tasks, expenses, media, activity, and identity modules.
- Clearly isolated presentation-only data in `src/features/dashboard/demo-data.ts`.

## Local setup

Requirements: Node.js 20.9+ and either MongoDB Atlas or a local MongoDB instance.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The sample dashboard works without a database. Once `MONGODB_URI` is configured, apply the planned indexes:

```bash
npm run db:indexes
```

Production build:

```bash
npm run build
npm start
```

## Configuration

Copy `.env.example` to `.env.local`; it contains every current configuration key and no secrets. `MONGODB_URI` and `MONGODB_DB` enable server data access. Configure passwordless authentication, a mail provider, WhatsApp, and R2 only when those documented integrations are implemented and their providers selected.

## API foundation

- `GET /api/v1/health` checks application status and whether a database URI is present.
- `GET /api/v1/weddings/:weddingId/events` lists planned events.
- `POST /api/v1/weddings/:weddingId/events` validates and creates an event.

The private event routes currently have a deliberately temporary `requireMembership` adapter. It expects an `x-development-user-id` header only to demonstrate server-side membership resolution once an auth provider is selected; it is not a replacement for passwordless sessions and must be replaced before deployment.

## Important implementation boundaries

- No auth provider, email provider, WhatsApp provider, or R2 bucket has been selected or configured.
- No external messages, uploads, signed URLs, sessions, or webhooks are faked or enabled.
- The API, repository, validation, and index patterns are intended to be extended feature by feature according to [`doc/API-DOCUMENTATION.md`](./doc/API-DOCUMENTATION.md).
- MongoDB collections are intentionally schema-light at this stage; the application validates inputs, while collection validators/migrations can be added when the exact rollout policy is decided.

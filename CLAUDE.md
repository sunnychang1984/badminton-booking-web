# CLAUDE.md

This file provides guidance to AI assistants (including Claude) working on this codebase.

## Project Overview

Badminton Booking Web is a monorepo for a badminton court booking and event management system. Currently only the **backend** exists; the frontend workspace is declared but not yet implemented.

## Repository Structure

```
badminton-booking-web/
├── package.json              # Root monorepo config (npm workspaces)
├── .gitignore
├── README.md
├── CLAUDE.md                 # This file
└── backend/
    ├── package.json          # Backend dependencies and scripts
    └── src/
        ├── app.js            # Express server entry point
        ├── db.js             # PostgreSQL connection pool (pg)
        ├── models/
        │   └── schema.js     # Raw SQL DDL (not ORM models)
        └── routes/
            ├── events.js     # CRUD for badminton events
            ├── members.js    # Member management + absence tracking
            ├── pairings.js   # Smart pairing endpoints (stubs)
            └── registrations.js  # Event registration + check-in
```

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Runtime   | Node.js (>=14)                |
| Framework | Express.js                    |
| Language  | JavaScript (CommonJS modules) |
| Database  | PostgreSQL (pg driver)        |
| ORM       | Sequelize (declared dep, not yet used) |

## Development Commands

All commands run from the `backend/` directory:

```bash
# Install dependencies
npm install

# Start the server (production)
npm start          # runs: node index.js

# Start with auto-reload (development)
npm run dev        # runs: nodemon index.js
```

The server listens on `PORT` env variable, defaulting to **5000**.

**Note:** The `package.json` entry point references `index.js` but the actual server file is `src/app.js`. This mismatch means `npm start` and `npm run dev` will fail without an `index.js` that delegates to `src/app.js`.

## Monorepo Setup

The root `package.json` uses npm workspaces:
- `frontend/` — not yet created
- `backend/` — the active workspace

## Architecture & Patterns

### Data Storage

All route modules currently use **in-memory arrays** as mock storage. No routes are wired to the PostgreSQL database yet. The database connection pool (`db.js`) and SQL schema (`models/schema.js`) exist but are not integrated.

### Route Pattern

Each route file follows a consistent pattern:
1. Create an Express Router
2. Define endpoints using `router.get/post/put`
3. Use in-memory arrays for data
4. Return JSON responses with appropriate HTTP status codes
5. Export the router via `module.exports`

**Important:** The route files are defined but **not mounted** in `app.js`. The `app.js` file does not import or `app.use()` any of the route modules.

### API Endpoints

**Events** (`routes/events.js`):
- `POST /` — Create event
- `PUT /:id` — Update event
- `GET /` — List all events
- `GET /:id` — Get event by ID

**Members** (`routes/members.js`):
- `POST /members` — Create member
- `PUT /members/:id` — Update member
- `POST /members/:id/absences` — Record absence
- `GET /members` — List all members
- `GET /members/:id` — Get member by ID

**Registrations** (`routes/registrations.js`):
- `POST /register` — Register for event
- `POST /checkin` — Check in to event
- `GET /attendance/:eventId` — Get event attendance

**Pairings** (`routes/pairings.js`) — all stubs, no logic implemented:
- `POST /balanced` — Balanced skill pairing
- `POST /expert` — Expert player matching
- `POST /womens-doubles` — Women's doubles matching

### Error Handling

- 201 for successful creation
- 400 for missing required fields
- 404 for resource not found
- Error messages returned as `{ message: "..." }` JSON

### Authentication

Not implemented. The SQL schema includes a `password_hash` column in the `members` table, indicating future auth support, but no auth middleware or login endpoints exist.

## Database Schema

Four tables defined in `models/schema.js` (raw SQL, uses MySQL-style `AUTO_INCREMENT` despite PostgreSQL target):

- **events** — id, name, location, event_date, created_at
- **members** — id, username, email, password_hash, created_at
- **registrations** — id, member_id (FK), event_id (FK), registration_date
- **pairings** — id, event_id (FK), member1_id (FK), member2_id (FK), pairing_date

## Known Issues

1. **Routes not mounted** — Route files exist but are not imported or used in `app.js`
2. **Entry point mismatch** — `package.json` points to `index.js` but server code is in `src/app.js`
3. **Missing declared dependencies** — `body-parser` and `cors` are used in `app.js` but not listed in `package.json`
4. **Hardcoded DB credentials** — `db.js` has placeholder credentials instead of using environment variables
5. **Schema syntax mismatch** — SQL schema uses MySQL `AUTO_INCREMENT` but the database is PostgreSQL (should use `SERIAL`)
6. **No tests** — No test framework, test files, or test scripts configured
7. **No linting/formatting** — No ESLint, Prettier, or similar tooling
8. **Frontend missing** — Declared in workspaces but directory does not exist

## Environment Variables

| Variable | Purpose           | Default |
|----------|-------------------|---------|
| `PORT`   | Server listen port | `5000`  |

Database credentials should be configured via environment variables but are currently hardcoded in `db.js`.

## Conventions for AI Assistants

- **Module system:** Use CommonJS (`require`/`module.exports`), not ES modules
- **Routing:** Define routes via `express.Router()`, export the router
- **Response format:** Always return JSON; use `{ message: "..." }` for errors
- **HTTP status codes:** Use appropriate codes (201 for creation, 404 for not found, 400 for bad input)
- **No TypeScript** — the project uses plain JavaScript
- **Dependencies use `"latest"`** — when adding new dependencies, follow existing convention or pin specific versions

# Titans Bank – Branch Appointment Booking

This Booking application has been developed for the interview process.
Customers choose a service, a branch, and a time slot. They proceed to
enter their personal information to link the chosen options to. Then,
customers receive a simulated booking confirmation notification in the 
form of a popup with details of where the confirmation was theoretically 
sent via sms or email.

## Project layout

```
titans-bank/
├── backend/    NestJS API, TypeORM, SQLite
└── frontend/   Angular app with Angular Material
```

## Booking rules

Every branch offers the same four services and hours.
Rules are set in `backend/src/booking/booking-rules.ts`
Services and branches are in `backend/src/catalogue/catalogue.ts`.

Unique set of rules and their values for this project:

| Rule | Value |
| --- | --- |
| Services | Customer Service, Collections, Forex, Accounts & Lending |
| Branches | 13, at least one in each of the 9 provinces |
| Trading hours | Mon–Fri 09:00–15:00, Sat 09:00–13:00, closed Sundays and South African public holidays |
| Slot length | 30 minutes |
| Bookings per slot | 3 per branch, shared across all services. A full slot is no longer offered. |
| Booking window | Today (times not yet started) up to 30 days ahead |

## Instructions for running locally

Requires Node.js 22.12 or later (24 LTS recommended) and npm 11.

```bash
# API on http://localhost:3000/api (docs at /api/docs)
cd backend
npm install
npm run start:dev

# Web app on http://localhost:4200 (forwards /api to the backend)
cd frontend
npm install
npm start
```

On first start the API creates `backend/data/titans-bank.db` with a single
`appointments` table.

## Instructions for running with Docker

Requires Docker only (no Node.js needed). One container runs the API and
serves the web app, so everything is on a single port.

```bash
# From the project root (the folder containing the Dockerfile)

# 1. Build the image
docker build -t titans-bank .

# 2. Run it
docker run -d --name titans-bank -p 3000:3000 -v titans-data:/app/data titans-bank
```

Then open:

- Web app: http://localhost:3000
- API documentation: http://localhost:3000/api/docs

The `-v titans-data:/app/data` option keeps the bookings in a Docker volume,
so they survive the container being stopped, removed or rebuilt. Without it,
bookings are lost when the container is removed.

On first start with an empty database, five demo bookings are added
(references `TB-DEMO01` to `TB-DEMO05`) on the next open days, so there is
data to look at straight away.

Useful commands:

```bash
docker logs titans-bank        # view the API's output
docker stop titans-bank        # stop the app
docker start titans-bank       # start it again (bookings are kept)

# Rebuild after code changes (bookings in the volume are kept)
docker rm -f titans-bank
docker build -t titans-bank .
docker run -d --name titans-bank -p 3000:3000 -v titans-data:/app/data titans-bank

# Start again with an empty database (the demo bookings are re-added)
docker rm -f titans-bank
docker volume rm titans-data
```

Open the app via `localhost`. The API's security headers ask browsers to
use HTTPS, which the container does not provide, so opening it from another
computer by IP address over plain HTTP may not load.

### How to view the bookings in the Docker database

The container keeps its database in the `titans-data` volume, not in
`backend/data/titans-bank.db` (that file belongs to the local development
setup). To look at the Docker bookings:

1. Copy the database out of the container (from the project root):

   ```bash
   docker cp titans-bank:/app/data/titans-bank.db backend/data/titans-bank-docker.db
   ```

   `backend/data/*.db` is in `.gitignore`, so the copy is never committed.

2. Open `backend/data/titans-bank-docker.db` in a SQLite viewer, for example
   the "SQLite Viewer" extension in VS Code or
   [DB Browser for SQLite](https://sqlitebrowser.org/), and browse the
   `appointments` table.

The copy is a snapshot. To see bookings made after copying, close the file in
the viewer and run the `docker cp` command again. Editing the copy does not
change the app's data.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/services` | The four services |
| GET | `/api/branches` | Branches grouped by province, with trading hours |
| GET | `/api/holidays` | Public holidays (no bookings); the calendar greys these out |
| GET | `/api/availability?branchId=3&date=2026-12-01` | Times still free at a branch on a date |
| POST | `/api/appointments` | Book; returns the details and message for the confirmation pop-up |
| GET | `/api/health` | Health check |

Interactive documentation is served at `/api/docs`.

## Tests

```bash
cd backend && npm test
cd frontend && npm test -- --watch=false
```

## Design notes

**Overall structure** 
This app was built using NestJS API Angular. In development they
run separately (`ng serve` forwards `/api` to the backend). In Docker, the API
also serves the built Angular app, so everything runs from one container on
one port.

**Catalogue** 
Services, branches and trading hours are fixed reference data that rarely change, so they live in `catalogue.ts` and `booking-rules.ts`. Only bookings are stored in the database, in a single `appointments` table.

**Slot capacity** 
The capacity check and the save happen in one SQL statement
(`INSERT … SELECT … WHERE COUNT < 3`), so two customers cannot both take the
last place. If the slot fills with 3 bookings while a customer is still filling in their details, the API returns 409 and the app asks them to choose another time.
The user will automatically be directed to the Date & Time page for new slot selection.

**Public holidays** 
Fixed-date holidays and the rule that a holiday on a Sunday moves to Monday are all worked out in code, so the app works for any year without maintaining a list. The calendar greys these days out, and the API refuses bookings on them. This was done to reflect real life circumstances around the work environment.

**Validation on both sides** 
The Angular forms validate as the customer types, for convenience. The API validates every request again (class-validator DTOs), because it should not always rely on the browser, and rejects fields it does not expect.

**Frontend** 
Standalone components with signals - structured in this manner for ease of development. A Material stepper guides a customer through service, branch, date and time, details, and review. The app is themed with the bank's colours (blue, grey, white). After a booking is confirmed, the pop-up shows the reference and the
whole page resets for the next customer.
NOTE: there may seem to be a duplication of information on the confirmation popup, however this was deliberately done to show what the sms/email would read vs. what the pop up confirmation read (table).

**Security** 
Helmet sets security headers, including a Content Security
Policy that blocks inline scripts. This is why the splash screen's script is
a separate file and Angular's inline critical-CSS option is turned off.

**SQLite** 
Chosen for simplicity: no database server is needed, and the
database is a single file. TypeORM's `synchronize` creates the table on start-up.

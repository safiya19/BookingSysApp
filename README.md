# Titans Bank – Branch Appointment Booking

This Booking application has been developed for the interview process.
Customers choose a service, a branch, and a time slot. Then receive a
simulated booking confirmation notification in the form of a popup with
details of where the confirmation was theoretically sent either via sms or email.

> Work in progress. This README is completed on Friday with Docker
> instructions and design notes.

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

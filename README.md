# Titans Bank – Branch Appointment Booking

This Booking application has been developed for the interview process.
Customers choose a service, a branch and a time slot, then receive a
simulated booking confirmation.

> Work in progress. This README is completed on Friday with Docker
> instructions, the API reference and design notes.

## Project layout

```
titans-bank/
├── backend/    NestJS API, TypeORM, SQLite
└── frontend/   Angular app with Angular Material
```

## Booking rules

Every branch offers the same four services and keeps the same hours. These
are set in `backend/src/config/booking.config.ts`.

Unique set of rules and their values for this project:
| Services | Customer Service, Collections, Forex, Accounts & Lending |
| Trading hours | Mon–Fri 09:00–15:00, Sat 09:00–13:00, closed Sundays |
| Slot length | 30 minutes |
| Consultants per service | 5 (therefore, up to 5 bookings per service per slot) |
| Booking window | Up to 30 days ahead, with at least 1 hour's notice to mimic realistic setup |

## Instructions for running locally

Requires Node.js 22.12 or later (24 LTS recommended) and npm 11.

# API on http://localhost:3000/api
cd backend
npm install
npm run start:dev

# Web app on http://localhost:4200 (forwards /api to the backend)
cd frontend
npm install
npm start
```

On first start the API creates `backend/data/titans-bank.db`, runs the
database migrations and loads 15 branches and 4 services.

## Tests
cd backend && npm test
cd frontend && npm test -- --watch=false
```

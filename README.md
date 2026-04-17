# Medical Transportation Service

Full-stack web app for booking and managing medical transportation rides.

## Tech Stack

- Frontend: Next.js (React) + Tailwind CSS
- Backend: Node.js + Express (MVC architecture)
- Database: MongoDB + Mongoose
- Authentication: JWT

## Project Structure

```text
client/          # Next.js frontend
server/          # Express backend
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
```

## Setup

1. Install dependencies (already split by app):
   - Root: `npm install`
   - Frontend: `npm install --prefix client`
   - Backend: `npm install --prefix server`
2. Configure environment:
   - Copy `.env.example` to `.env` and fill values.
   - Copy `client/.env.local.example` to `client/.env.local`.
3. Run both services:
   - `npm run dev`

Frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`.

## API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` - get current user
- `PUT /api/auth/profile` - edit profile

### Rides (protected)
- `POST /api/rides` - create ride
- `GET /api/rides` - list user rides
- `GET /api/rides/stats` - total/upcoming/completed/pending stats
- `GET /api/rides/admin/dashboard` - admin dispatch dashboard
- `PATCH /api/rides/:rideId/status` - admin workflow update (`pending -> confirmed -> completed`)

### Public Emergency Requests
- `POST /api/public-rides/emergency`

## Notes

- Passwords are hashed with `bcryptjs`.
- JWT bearer tokens secure protected routes.
- Frontend includes form validation, loading states, icons, and toast notifications.
- Emergency form is available on a dedicated route: `/emergency-ride`.
- Admin role is enabled when a registered email exists in `ADMIN_EMAILS`.

## Tests

- Run backend tests: `npm test --prefix server`
- Includes:
  - unit test for JWT token utility
  - integration-style API tests for auth/profile and ride status workflow

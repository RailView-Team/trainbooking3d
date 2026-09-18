# TrainBooking 3D View

This project has been organized as a simple monorepo with separate frontend and backend responsibilities.

## Structure

- backend/ - Express.js API, database setup, and server logic
- frontend/ - client application workspace for the UI layer

## Backend

The backend app is located in [backend/package.json](backend/package.json) and contains:

- API routes in [backend/src/routes](backend/src/routes)
- Database connection in [backend/src/db.js](backend/src/db.js)
- Middleware in [backend/src/middleware](backend/src/middleware)
- JWT utilities in [backend/src/utils](backend/src/utils)

Run it from the backend folder:

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` from `backend/.env.example` first, and provision PostgreSQL using
`backend/database/schema.sql` followed by `backend/database/seed.sql`.

## Frontend

The frontend folder is intentionally kept separate for the UI application, such as React, Vite, or another client stack.

Run the frontend from its folder with `npm install` and `npm run dev`.

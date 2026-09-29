<div align="center">

# 🚆 RailVista — Indian Railway Booking Platform

**A full-stack, production-grade Indian railway ticket reservation system with immersive 3D coach visualization, real-time seat availability, and end-to-end booking flow.**

Built with React 19 · Three.js · Express 5 · PostgreSQL

[Live Demo](#deployment) · [Getting Started](#getting-started) · [Architecture](#architecture) · [API Reference](#api-reference)

</div>

---

## ✨ Features

### 🎫 Complete Booking Flow
- **Train Search** — Search trains by origin, destination, and date with support for partial-route (intermediate stop) queries
- **Class Selection** — Browse available classes (1AC, 2AC, 3AC, Sleeper, Executive Chair, AC Chair Car, 2nd Sitting) with live seat availability, fare comparison, and feature highlights
- **Coach Selection** — View coach layouts and pick your preferred coach within a class
- **Seat Selection** — Choose seats in both **interactive 2D grid** and **immersive first-person 3D** views
- **Passenger Details** — Multi-passenger form with name, age, gender, and berth preference
- **Booking Review & Checkout** — Dynamic fare breakdown, passenger reconciliation, and payment initialization with proper error handling
- **Payment Processing** — Simulated payment gateway with UPI, card, and net banking options
- **Booking Confirmation** — PNR generation, e-ticket summary, and booking history

### 🏗️ Immersive 3D Coach Visualization
- **Realistic GLB Models** — Pre-built 3D coach interiors for AC Chair Car (CC) and 3-Tier AC (3AC) with individually selectable seat meshes
- **First-Person Navigation** — Walk through the coach interior using WASD/arrow keys and mouse drag
- **Interactive Seats** — Click seats in 3D to select/deselect with real-time color coding (available / selected / booked)
- **Seat Focus Camera** — Click a seat to smoothly fly the camera to that seat's position
- **Responsive Fallback** — Automatic 2D seat map for mobile or low-capability devices

### 🔒 Robust Backend
- **Concurrency-Safe Booking** — PostgreSQL row-level locking with `FOR UPDATE` to prevent double-booking
- **Partial-Route Availability** — Segment-overlap detection allows the same seat to be booked for non-overlapping segments of the same trip
- **JWT Authentication** — Secure user registration, login, and session management
- **AI Chatbot** — Railway assistant chatbot for booking guidance and train queries

---

## 📁 Project Structure

```
trainbooking3d/
├── backend/                    # Express.js REST API
│   ├── database/
│   │   ├── schema.sql          # Full PostgreSQL schema (11 tables)
│   │   └── seed.sql            # Sample Indian railway data
│   ├── src/
│   │   ├── server.js           # Express app entry point
│   │   ├── db.js               # PostgreSQL connection pool
│   │   ├── middleware/         # JWT auth middleware
│   │   ├── routes/
│   │   │   ├── stations.routes.js
│   │   │   ├── trains.routes.js
│   │   │   ├── bookings.routes.js
│   │   │   ├── auth.routes.js
│   │   │   └── chat.routes.js
│   │   └── utils/              # PNR generator, helpers
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React 19 + Vite 8 SPA
│   ├── public/
│   │   ├── models/
│   │   │   ├── train-seat.glb          # Individual seat model
│   │   │   └── coaches/
│   │   │       ├── 3ac/coach.glb       # 3-Tier AC coach interior
│   │   │       └── cc/coach.glb        # AC Chair Car coach interior
│   │   ├── seats/              # Class reference images
│   │   └── train-frames/       # Animation sequence frames
│   ├── src/
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # Tailwind v4 theme
│   │   ├── coachData.js        # Class definitions, seat mappings, layouts
│   │   ├── context/            # AuthContext provider
│   │   ├── service/api.js      # Axios API client with interceptors
│   │   ├── pages/              # 11 route pages (see Routing below)
│   │   └── components/
│   │       ├── CoachViewer3D.jsx       # Three.js first-person coach renderer
│   │       ├── SeatMap2D.jsx           # 2D seat grid component
│   │       ├── Chatbot.jsx             # AI assistant widget
│   │       └── ...                     # 20+ UI components
│   ├── .env.example
│   └── package.json
│
├── render.yaml                 # Render deployment blueprint
├── vercel.json                 # Vercel frontend deployment config
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | v20+ (v24 recommended) |
| **PostgreSQL** | 14+ |
| **npm** | 10+ |

### 1. Clone the Repository

```bash
git clone https://github.com/RailView-Team/trainbooking3d.git
cd trainbooking3d
```

### 2. Set Up the Database

Create a PostgreSQL database and run the schema and seed scripts:

```bash
createdb aerorail

psql -d aerorail -f backend/database/schema.sql
psql -d aerorail -f backend/database/seed.sql
```

This creates 11 tables (`stations`, `trains`, `train_trips`, `route_stops`, `coaches`, `seats`, `users`, `bookings`, `passengers`, `booking_seats`, `payments`) and populates them with sample Indian railway data including stations, trains (Vande Bharat, Rajdhani, Shatabdi, etc.), coaches, and seats.

### 3. Configure Environment Variables

**Backend** — copy and edit `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/aerorail
JWT_SECRET=replace-with-a-long-random-secret

# Optional: External Indian Railways API
RAILWAY_API_KEY=your_rapidapi_key
RAILWAY_API_HOST=irctc1.p.rapidapi.com
```

**Frontend** — copy and edit `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Install Dependencies & Start

**Backend:**

```bash
cd backend
npm install
npm run dev          # Starts on http://localhost:3000 with --watch
```

**Frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) to access the application.

---

## 🏛️ Architecture

### Frontend

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 with React Compiler |
| **Build Tool** | Vite 8 + Rolldown |
| **3D Engine** | Three.js via `@react-three/fiber` + `@react-three/drei` |
| **Styling** | Tailwind CSS v4 (Plus Jakarta Sans font) |
| **Routing** | React Router v7 (SPA) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **HTTP Client** | Axios with JWT interceptors |

### Backend

| Layer | Technology |
|-------|-----------|
| **Framework** | Express 5 (ESM) |
| **Database** | PostgreSQL 14+ via `pg` driver |
| **Authentication** | JWT (`jsonwebtoken`) + bcrypt password hashing |
| **Security** | Helmet, CORS with allowlisted origins |
| **Logging** | Morgan (dev mode) |

### Database Schema

```
stations ──┐
            ├── train_trips ──┬── route_stops
trains ────┘                  │
                              ├── coaches ── seats
                              │
users ── bookings ─┬── passengers
                   ├── booking_seats
                   └── payments
```

**Key Tables:**
- **`stations`** — Indian railway stations with code, city, state, and coordinates
- **`trains`** — Train metadata (number, name, type, amenities)
- **`train_trips`** — Origin-destination journeys with timings
- **`route_stops`** — Intermediate stops with sequence, timings, platform, and distance
- **`coaches`** — Coach inventory per train (class code, fare, capacity)
- **`seats`** — Individual seats per coach (seat number, berth type)
- **`bookings`** — Reservations with PNR, trip, coach, boarding/alighting stops, journey date, status, and payment status
- **`booking_seats`** — Many-to-many: booked seats per booking
- **`passengers`** — Passenger records per booking (name, age, gender, berth preference)
- **`payments`** — Payment transaction records per booking

---

## 🗺️ Routing

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with search, popular routes, features |
| `/trains` | Search Results | Train listings matching search criteria |
| `/trains/:trainId` | Train Details | Detailed view with schedule and stops |
| `/trains/:trainId/class` | Class Selection | Compare travel classes, fares, and features |
| `/trains/:trainId/coach` | Coach Selection | Pick a specific coach |
| `/trains/:trainId/seats` | Seat Selection | Interactive 2D/3D seat picker |
| `/booking/passengers` | Passenger Details | Multi-passenger entry form |
| `/booking/review` | Booking Review | Checkout summary, fare breakdown, payment CTA |
| `/booking/payment` | Payment | Simulated payment gateway |
| `/booking/confirmation` | Confirmation | PNR, e-ticket, and booking receipt |
| `/bookings` | My Bookings | Authenticated user's booking history |

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Database connectivity check |

### Stations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stations` | List / search all stations |
| `GET` | `/api/stations/:code` | Get station by code |

### Trains

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trains/search?from=MMCT&to=ADI&date=2026-10-15` | Search trains between stations |
| `GET` | `/api/trains/:trainId` | Get train details |
| `GET` | `/api/trains/:trainId/schedule` | Get train route & intermediate stops |
| `GET` | `/api/trains/:trainId/classes` | Get available classes for a train |
| `GET` | `/api/trains/:trainId/availability?from=MMCT&to=ADI&date=2026-10-15` | Live seat availability with partial-route overlap detection |

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/bookings` | Optional | Create booking reservation |
| `GET` | `/api/bookings/:id` | No | Get booking by ID or PNR |
| `POST` | `/api/bookings/:id/payment` | No | Process payment for a booking |
| `POST` | `/api/bookings/:id/cancel` | Optional | Cancel a booking |
| `GET` | `/api/bookings` | Required | List authenticated user's bookings |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile (requires JWT) |

### Chatbot

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message to railway assistant |

---

## 🎮 3D Coach Viewer

The 3D coach visualization is the highlight feature of RailVista. It uses **React Three Fiber** to render detailed GLB coach interiors in a first-person perspective.

### Controls

| Input | Action |
|-------|--------|
| **W / ↑** | Walk forward |
| **S / ↓** | Walk backward |
| **A / ←** | Strafe left |
| **D / →** | Strafe right |
| **Mouse drag** | Look around |
| **Touch drag** | Look around (mobile) |
| **Click seat** | Select / deselect seat |
| **Reset button** | Return to default camera position |

### Seat Color Coding

| Color | State |
|-------|-------|
| 🟢 Green | Available |
| 🔵 Blue | Selected by you |
| 🔴 Red | Already booked |
| 🟡 Yellow | Previewed / hovered |

### Supported Coach Models

| Class | Model Path | Seats |
|-------|-----------|-------|
| AC Chair Car (CC) | `models/coaches/cc/coach.glb` | 64 individually named meshes (`Seat_01_L1` – `Seat_16_R2`) |
| 3-Tier AC (3AC) | `models/coaches/3ac/coach.glb` | Full sleeper berth layout |
| Other classes | Procedurally generated | Dynamic grid-based layouts |

---

## 🌐 Deployment

### Frontend — Vercel

The frontend is configured for Vercel deployment via `vercel.json`:

```bash
vercel --prod
```

Set `VITE_API_URL` in Vercel environment variables to point to your backend.

### Backend — Render

The backend is configured for Render deployment via `render.yaml`:

1. Connect your GitHub repository to Render
2. The blueprint creates:
   - **Web Service** (`aerorail-api`) — Node.js, auto-builds from `backend/`
   - **Database** (`aerorail-db`) — Managed PostgreSQL (free tier)
3. `DATABASE_URL` is automatically injected from the database service
4. Set `CORS_ORIGIN` to your Vercel frontend URL

### Manual Deployment

```bash
# Backend
cd backend
npm ci
NODE_ENV=production npm start

# Frontend
cd frontend
npm ci
npm run build        # Outputs to frontend/dist/
```

---

## 🧪 Testing

### Backend API

Use the health check endpoint to verify the backend is running:

```bash
curl http://localhost:3000/api/health
```

Test booking creation:

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "trainId": 5,
    "from": "MMCT",
    "to": "ADI",
    "date": "2026-09-29",
    "classCode": "CC",
    "coachId": 17,
    "seats": [944],
    "passengers": [{
      "name": "Test User",
      "age": 25,
      "gender": "male"
    }],
    "contactEmail": "test@example.com",
    "contactPhone": "9876543210"
  }'
```

### Frontend Build

```bash
cd frontend
npm run build        # Zero-error production build
npm run preview      # Preview production build locally
```

---

## 🎨 Design System

RailVista follows a clean Indian railway booking aesthetic:

| Element | Value |
|---------|-------|
| **Primary Font** | Plus Jakarta Sans |
| **Background** | `#f8fafc` (cool slate) |
| **Heading Color** | `#0f172a` (dark navy) |
| **Primary Accent** | `#2563eb` (blue-600) |
| **Cards** | White, rounded-2xl, subtle borders, minimal shadows |
| **Status Badges** | Emerald (available), Blue (selected), Rose (error) |

---

## 👥 Team

**RailView Team** — [github.com/RailView-Team](https://github.com/RailView-Team)

---

## 📄 License

This project is developed for educational and demonstration purposes.

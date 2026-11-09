# 🔥 Ember: Restaurant Management System (MERN)

A restaurant website and management dashboard built on the MERN stack, with 3D scenes, GSAP scroll animations and a lot of motion.

**Stack:** MongoDB · Express 5 · React 19 · Node.js · Vite · Tailwind CSS v4

## ✨ Animation and 3D features

| Feature | Where | Tech |
| --- | --- | --- |
| Count-up preloader with a curved curtain reveal | First load | GSAP timeline |
| Interactive 3D hero dish: lathe-modelled plate, molten distort sphere, golden orbit rings, floating ingredients, sparkles. It follows the mouse and rises as you scroll | Home hero | Three.js · React Three Fiber · Drei |
| **Orbital cards**: dishes orbit a 3D golden cloche on an elliptical path. Scroll spins the orbit and lifts the cloche lid | Home | GSAP ScrollTrigger (pin + scrub) + R3F |
| **Side motion**: vertical scroll drives horizontal travel, with panels that skew to scroll velocity and parallax images | "Ember journey" | ScrollTrigger `containerAnimation` |
| Sticky stacked cards that shrink and tilt back as the next card slides over | Experiences | ScrollTrigger scrub |
| Word-by-word masked text reveals and scroll-lit statement text | Everywhere | GSAP |
| Opposite-direction ribbons and testimonial rows driven by scroll | Home | GSAP scrub |
| Chef cards fly in from alternating sides, then tilt in 3D on hover | Home | GSAP + Framer Motion |
| 3D tilt cards with glare, magnetic buttons, spotlight panel, custom cursor | UI kit (21st.dev style) | Framer Motion · GSAP `quickTo` |
| Buttery smooth scrolling | Global | Lenis, synced to the GSAP ticker |
| Route curtain transitions, shared-layout pills, animated cart drawer | Global | Framer Motion |

## 🍽️ Management features

- **Menu**: category filters, search, add to cart. Data comes from MongoDB, with an offline fallback.
- **Online ordering**: pickup, delivery or dine-in. The server recalculates prices and tax from the database.
- **Reservations**: party size, date and time slots, occasion and notes, with validation.
- **Staff dashboard** (`/admin`, JWT auth):
  - Revenue, active-order and booking stats, plus a best-sellers chart
  - Update order status: pending → preparing → ready → served
  - Manage reservation status
  - Menu CRUD (add, delete, toggle availability or "featured on orbit")

## 🚀 Getting started

```bash
npm run install:all     # installs root, server and client dependencies
cp server/.env.example server/.env
npm run dev             # API on :5000 + React on :5173
```

Open http://localhost:5173.

> **No MongoDB installed?** Leave `MONGO_URI` empty in `server/.env`. In development the server starts an
> **in-memory MongoDB** automatically (`mongodb-memory-server`) and seeds the menu and an admin user.
> Data resets on restart. For persistent data, set `MONGO_URI` to a local MongoDB or a MongoDB Atlas connection string.

**Dashboard login (dev):** `admin@ember.com` / `admin123`. Change these with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

### Troubleshooting

- **`/api/... 502 (Bad Gateway)` in the browser console**: the React app is running but the API on port 5000 is not.
  Run `npm run dev` from the **repo root** (not inside `client/`) so both start, and read the `[api]` lines in the terminal.
  On the very first run the in-memory MongoDB downloads its binary once (it can be 700+ MB on Windows), so the API can take several minutes to come up. Leave it running.
  While it is down the menu falls back to an offline copy, but orders and reservations cannot be saved.
- **`THREE.Clock: This module has been deprecated`**: a harmless warning from inside React Three Fiber with the latest
  three.js. It is not from this project's code and does not affect anything.

### Production

```bash
npm run build   # builds client/dist
npm start       # Express serves the API and the built React app on :5000
```

Set `NODE_ENV=production`, `MONGO_URI` and a strong `JWT_SECRET` in production.

## 📁 Structure

```
client/                     React + Vite
  src/components/three/     3D scenes (HeroScene, ClocheScene)
  src/components/ui/        Animated UI kit (MagneticButton, TiltCard, SplitReveal, Marquee…)
  src/components/layout/    Navbar, Footer, CartDrawer, Preloader, CustomCursor
  src/sections/             Home page sections (Hero, OrbitalMenu, HorizontalJourney…)
  src/pages/                Home, Menu, Reservations, Checkout, Admin
server/                     Express + Mongoose
  src/models/               MenuItem, Order, Reservation, User
  src/controllers/          Business logic
  src/routes/               REST API (/api/*)
  src/data/                 Seed menu + seeder
```

## 🔌 API

| Method | Endpoint | Auth |
| --- | --- | --- |
| GET | `/api/menu?category=&featured=&q=` | public |
| POST/PUT/DELETE | `/api/menu/:id` | admin |
| POST | `/api/orders` | public |
| GET | `/api/orders` · PATCH `/api/orders/:id/status` | staff |
| POST | `/api/reservations` | public |
| GET | `/api/reservations` · PATCH `/api/reservations/:id/status` | staff |
| POST | `/api/auth/login` · GET `/api/auth/me` | — / staff |
| GET | `/api/stats` | staff |

Accessibility: animations respect `prefers-reduced-motion`, WebGL canvases pause when off-screen, and the custom cursor is disabled on touch devices.

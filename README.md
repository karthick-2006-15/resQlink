# ResQLink — Community Emergency Resource Coordination Platform

> **"When help is nearby, make it reachable."**

ResQLink is a production-quality community emergency coordination platform engineered to connect households in urgent need of non-medical resources with verified, nearby community volunteers.

---

## 📑 Table of Contents

- [Executive Summary](#executive-summary)
- [The Problem vs. Our Solution](#the-problem-vs-our-solution)
- [End-to-End Workflow](#end-to-end-workflow)
- [Key Features by Role](#key-features-by-role)
- [System Architecture](#system-architecture)
- [Algorithmic Engines](#algorithmic-engines)
  - [Priority Engine](#priority-engine)
  - [Matching Engine](#matching-engine)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Specifications](#api-specifications)
- [Getting Started & Local Run](#getting-started--local-run)
- [Instant Hackathon Demo Accounts](#instant-hackathon-demo-accounts)
- [Automated Testing Suite](#automated-testing-suite)
- [Deployment Guide](#deployment-guide)

---

## 🚨 Executive Summary

During natural disasters (earthquakes, flash floods, hurricanes, severe grid outages), informal community relief groups rely on chaotic messaging apps or spreadsheets. This causes:
1. **Critical Requests Lost in Noise:** High-risk vulnerable individuals (infants, elderly) wait hours while non-urgent requests receive attention first.
2. **Double Dispatch & Waste:** Multiple volunteers arrive at the same location while nearby homes are unattended.
3. **Safety & Zero Verification:** Unvetted responders create security concerns.
4. **Lack of Dual Confirmation:** Deliveries are reported completed when supplies were dropped at the wrong address.

**ResQLink fixes community disaster logistics** with algorithmic priority scoring, geographic Haversine radius matching, transactional locks against race conditions, and dual-confirmation closing protocols.

---

## 🔄 End-to-End Workflow

```text
Landing Page (Live Crisis Map & Real KPI Counters)
      ↓
Registration / Role Selection (Citizen / Volunteer)
      ↓
Role-Based Authenticated Console
      ↓
Citizen Submits Emergency Request (Water, Food, Transport, Shelter)
      ↓
System Priority Engine (Urgency + Population + Resource Weight + Aging)
      ↓
Admin Command Center Review & Verification
      ↓
Haversine Proximity Matching Engine Dispatches to Eligible Volunteers
      ↓
Volunteer Receives Real-time Alert & Accepts Dispatch (Database Transaction Guard)
      ↓
Citizen Receives Real-Time Timeline Progression
      ↓
Volunteer Commences Transit ("Start Delivery")
      ↓
Volunteer Arrives & Marks "Delivered"
      ↓
Citizen Receives Notification & Confirms Delivery Receipt
      ↓
Request Formally Closed & Volunteer Stats / Analytics Updated
```

---

## 👥 Key Features by Role

### 1. Citizen Portal
- **Rapid Emergency Request Wizard (6-Step flow):**
  - Resource selection: Clean Water, Emergency Food, Relocation Transport, Temporary Shelter, General Supplies
  - Quantitative requirements & affected population counts
  - Urgency categorization (Normal, High, Critical)
  - GPS device location acquisition or pin placement
- **Live Lifecycle Timeline:**
  - Real-time visual progress: Submitted &rarr; Verified &rarr; Matched &rarr; Volunteer Assigned &rarr; Delivery In Transit &rarr; Delivered &rarr; Closed
- **Assigned Responder Telemetry:** Contact details, rating, and vehicle capacity.
- **Dual Confirmation & Problem Reporting:** Confirm supplies receipt or file an operational dispute to the command center.

### 2. Volunteer Hub
- **Availability Toggle:** Instant on/off-duty toggle (🟢 Available / ⚪ Unavailable).
- **Radius-Aware Nearby Dispatch Feed:** Distance calculated via Great-Circle Haversine formula against the volunteer's configured operational radius (km).
- **Transactional Assignment Acceptance:** Database transaction guarantees no two volunteers can accept the same emergency dispatch.
- **Mission Execution Panel:** "Start Delivery Transit" &rarr; "Mark Delivered".
- **Dispatch Settings:** Custom service radius slider (1–35 km) and capability checkboxes.

### 3. Admin Command Center
- **Tactical Crisis Grid Map:** Full-screen Leaflet interactive map with custom colored beacons (🔴 Critical, 🟠 High, 🟡 Normal, 🔵 Assigned, 🟢 Delivered).
- **Rapid Verification Queue:** 1-click verification of incoming citizen emergencies and new volunteer credentials.
- **Matching Engine Inspector:** Ranks candidate volunteers using distance, workload penalty, capability match, and rating.
- **Executive Analytics:** Interactive charts powered by Recharts (Resource volume, Priority breakdown, Status state distribution, Volunteer leaderboard).
- **Immutable Audit Trail:** Chronological compliance log of all system mutations and authorizations.

---

## 📐 Algorithmic Engines

### Priority Scoring Engine (`src/lib/services/priority.service.ts`)
Objective priority score ($0 - 100$) dynamically calculated from:
$$\text{Priority Score} = \text{Urgency Score (40\%)} + \text{Population Score (30\%)} + \text{Resource Criticality (20\%)} + \text{Aging Factor (10\%)}$$

- **Urgency Weights:** `CRITICAL` (40 pts), `HIGH` (28 pts), `NORMAL` (15 pts)
- **Population Affected:** $\ge 20$ people (30 pts), $\ge 10$ (24 pts), $\ge 5$ (18 pts), $\ge 2$ (10 pts), $1$ person (5 pts)
- **Resource Criticality:** Water (20 pts), Shelter (18 pts), Food (15 pts), Transport (12 pts), Other (8 pts)
- **Starvation Aging Factor:** Automatically adds points for every hour a request remains unaddressed.
- **Classification:** Score $\ge 75 \implies \text{CRITICAL}$, $\ge 45 \implies \text{HIGH}$, else $\text{NORMAL}$.

### Haversine Proximity Matching Engine (`src/lib/services/matching.service.ts`)
Calculates the shortest distance between volunteer GPS coordinates and the delivery address:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

Evaluates candidates through four mandatory gates:
1. `isVerified === true`
2. `isAvailable === true`
3. `capabilities.includes(request.resourceType)`
4. $\text{distance} \le \text{volunteer.serviceRadiusKm}$

Ranks candidates using:
$$\text{Candidate Match Score} = \text{Distance Score (40 pts)} + \text{Workload Score (25 pts)} + \text{Resource Match (20 pts)} + \text{Rating \& Experience (15 pts)}$$

---

## 💻 Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS with custom design system |
| **Components** | Radix UI / custom accessible UI primitives |
| **Motion & Micro-interactions** | Framer Motion |
| **Interactive Maps** | Leaflet & React-Leaflet with custom SVG beacons |
| **Charts & Analytics** | Recharts (Responsive bar and distribution charts) |
| **Database & ORM** | Prisma ORM with SQLite (local zero-friction) / PostgreSQL ready |
| **Authentication** | Jose JWT session tokens & Bcrypt password hashing |
| **Validation** | Zod schema validation |
| **Alerts & Toasts** | Sonner toast notifications |

---

## 🗄️ Database Schema

The database model is normalized and indexed for performance:
- `User`: Accounts, credentials, roles (`CITIZEN`, `VOLUNTEER`, `ADMIN`), contact info.
- `VolunteerProfile`: Service radius, JSON capabilities array, availability flag, vehicle type, rating.
- `EmergencyRequest`: Resource type, quantity, coordinates, priority score & level, lifecycle status.
- `Assignment`: Transactional relationship connecting an emergency request to an assigned volunteer.
- `Notification`: In-app database-backed notification system with read tracking.
- `AuditLog`: Immutable compliance trail recording actor, action, entity, and old/new values.
- `DeliveryDispute`: Tracks citizen-reported delivery problems.

---

## 🔑 Instant Hackathon Demo Accounts

Pre-seeded credentials for 1-click evaluation during live demonstrations:

| Role | Email | Password | Pre-configured State |
|---|---|---|---|
| **Citizen** | `demo.citizen@example.com` | `password123` | Active requests, delivery waiting confirm |
| **Volunteer** | `demo.volunteer@example.com` | `password123` | 18 completed missions, 4.9⭐, active delivery |
| **Admin** | `demo.admin@example.com` | `password123` | Operations lead access to full command grid |

> 💡 **Tip:** Use the **"Demo Switcher"** button in the top navigation bar to switch between Citizen, Volunteer, and Admin in one click!

---

## 🚀 Getting Started & Local Run

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or pnpm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Run Seed
```bash
# Push schema to SQLite database
npx prisma db push

# Populate with standard demo dataset (27 active, 14 volunteers, 83 resolved)
npm run db:seed
```

### 3. Run Automated Test Suite
```bash
node tests/test-suite.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Testing Suite

Run the built-in test suite verifying core algorithms:
```bash
node tests/test-suite.js
```
Verifies:
- Priority engine urgency and population weighting
- Matching engine filters (capability, availability, radius exclusion)
- Request lifecycle state machine invalid jump rejections
- Bcrypt password hash and authorization checks

---

## 🌐 Production Deployment

Ready for 1-click deployment on **Vercel**:
1. Push repository to GitHub.
2. Import project into Vercel.
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`).
4. Set Build Command: `npm run build`.

# MediCare – Hospital Management System

A full-stack **Hospital Management System (HMS)** with a modern healthcare blue UI redesign, designed to digitize and streamline hospital operations across all departments.

> Based on [tdillangakoon/hospital-management-system](https://github.com/tdillangakoon/hospital-management-system), with a redesigned UI.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Live Deployment](#live-deployment)
- [Run Locally (Windows)](#run-locally-windows)
- [Environment Variables Reference](#environment-variables-reference)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Security](#security)
- [⚠️ Demo Data Disclaimer](#️-demo-data-disclaimer)

---

## Project Overview

**MediCare** is a full-stack web application that centralises hospital administration — from front-desk patient registration to lab results, pharmacy inventory, billing, inpatient bed management, HR/attendance, and system audit trails.

The UI was redesigned from scratch using a **healthcare blue design system** (`#1E6FD9` primary, `#0B2A4A` dark navy, `#F5F8FC` background) with WCAG-AA compliant contrast, responsive layout (desktop/tablet/mobile), and reusable React components.

---

## Features

| Module | Key Capabilities |
|---|---|
| **Authentication** | JWT login, 30-min inactivity timeout, session warning toast, change password |
| **Dashboard** | Role-adaptive stat cards, revenue chart, today's appointments, low-stock alerts |
| **Patients** | Searchable/sortable/paginated table, profile tabs (overview, records, prescriptions, documents, billing) |
| **Appointments** | Calendar + list view, doctor filter, status badges, booking modal |
| **Medical Records** | EMR entry, diagnosis, prescription, clinical notes |
| **Laboratory** | Test request queue, sample collection workflow, result entry, report print |
| **Pharmacy** | Inventory table, low-stock/expiry warnings, prescription dispensing |
| **Billing** | Itemised invoice generation, payment recording, print-friendly receipt |
| **Inpatient** | Ward/bed management, admissions, discharge workflow |
| **Doctors** | Physician directory, specialisation filter, schedule management |
| **Staff & HR** | Employee records, daily attendance log, leave request approval |
| **Schedules** | Doctor duty roster management |
| **Documents** | Patient document uploads, download/view links |
| **Reports** | Analytical reports with date/department filters, CSV/JSON export |
| **Audit Logs** | Compliance log for all user actions |
| **Backups** | Manual and scheduled backup triggers, disaster recovery |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v7, Redux Toolkit, Recharts, Lucide React |
| **Backend** | Node.js, Express 5, Prisma ORM, PostgreSQL |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Styling** | Custom CSS design system (CSS variables), no CSS framework dependency |
| **File Uploads** | Multer |
| **Scheduled Jobs** | node-cron (automated backups) |
| **Deployment** | Frontend → Vercel / Netlify; Backend → Render / Railway; DB → Neon / Render PostgreSQL |

---

## Live Deployment

> **Note:** Deployment requires free-tier cloud accounts (Vercel/Netlify for frontend, Render/Railway + Neon for backend & database). See the [deployment setup](#deployment-setup) steps below if you haven't deployed yet.

| Service | URL |
|---|---|
| **Frontend / Live Application** | https://hospital-management-system-six-chi.vercel.app |
| **Backend API** | https://hospital-management-system-production-1615.up.railway.app/api |

### Demo Login Credentials

> ⚠️ These accounts use **fake, demo-only data**. Never use these credentials in a real production system.

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@hospital.com` | `Admin@123` |
| **Doctor** | `doctor@hospital.com` | `Doctor@123` |
| **Nurse** | `nurse@hospital.com` | `Nurse@123` |
| **Receptionist** | `reception@hospital.com` | `Reception@123` |
| **Lab Technician** | `lab@hospital.com` | `Lab@123` |
| **Pharmacist** | `pharmacy@hospital.com` | `Pharmacy@123` |
| **Accountant** | `accountant@hospital.com` | `Accountant@123` |

---

## Run Locally (Windows)

### Prerequisites

- **Node.js** v18+ — download from [nodejs.org](https://nodejs.org)
- **PostgreSQL** (local instance or a free cloud DB like [Neon](https://neon.tech))
- **Git** — download from [git-scm.com](https://git-scm.com)

### Step 1 — Clone the Repository

```bat
git clone https://github.com/ihara2316kookie-hash/Hospital-Management-System.git
cd "Hospital-Management-System"
```

### Step 2 — Backend Setup

```bat
cd hospital-backend
npm install
```

Create a `.env` file inside `hospital-backend\` (copy from `.env.example`):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_db?schema=public"
JWT_SECRET="replace_with_a_long_random_string"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

Run database migrations and seed demo data:

```bat
npx prisma migrate deploy
npx prisma generate
node prisma/seed.js
```

Start the backend server:

```bat
npm start
```

Backend will be available at: **http://localhost:5000**

### Step 3 — Frontend Setup

Open a **new terminal window** and from the project root:

```bat
cd hospital-frontend
npm install
```

Create a `.env` file inside `hospital-frontend\` (copy from `.env.example`):

```env
VITE_API_URL="http://localhost:5000/api"
```

Start the development server:

```bat
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |

---

## Deployment Setup

### Frontend (Vercel — recommended)

1. Push this repo to GitHub (already done).
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the GitHub repo.
3. Set **Root Directory** to `hospital-frontend`.
4. Add environment variable: `VITE_API_URL` = your backend URL (e.g. `https://your-app.onrender.com/api`).
5. Click **Deploy**. Vercel uses `vercel.json` in `hospital-frontend/` for SPA routing.

### Backend (Render — recommended)

1. Go to [render.com](https://render.com) → **New Web Service** → connect GitHub repo.
2. Set **Root Directory** to `hospital-backend`.
3. **Build Command:** `npm install && npx prisma generate`
4. **Start Command:** `npx prisma migrate deploy && node prisma/seed.js && node src/index.js`
5. Add environment variables:
   - `DATABASE_URL` — from your PostgreSQL provider (Neon, Render DB, etc.)
   - `JWT_SECRET` — a long random string
   - `PORT` — `5000`
   - `FRONTEND_URL` — your Vercel frontend URL

### Database (Neon — recommended free tier)

1. Sign up at [neon.tech](https://neon.tech).
2. Create a new project → copy the **Connection String**.
3. Paste it as `DATABASE_URL` in Render's environment variables.

---

## Environment Variables Reference

### Backend (`hospital-backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Prisma format) |
| `JWT_SECRET` | ✅ | Long random string used to sign JWT tokens |
| `PORT` | ✅ | Port the Express server listens on (default: 5000) |
| `FRONTEND_URL` | ✅ | Frontend origin for CORS (e.g. `https://yourapp.vercel.app`) |

### Frontend (`hospital-frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Full URL of the backend API (e.g. `https://yourapi.onrender.com/api`) |

---

## User Roles

| Role | Access |
|---|---|
| **ADMIN** | Full system access — users, settings, audit logs, backups |
| **DOCTOR** | Patients, appointments, medical records, lab results |
| **NURSE** | Patient care, inpatient management, medical records |
| **RECEPTIONIST** | Patient registration, appointment booking, documents |
| **LAB_TECHNICIAN** | Lab requests, sample collection, result entry |
| **PHARMACIST** | Pharmacy inventory, medicine dispensing |
| **ACCOUNTANT** | Billing, payment recording, financial reports |

---

## API Overview

All routes are prefixed with `/api`.

| Prefix | Module |
|---|---|
| `/api/auth` | Authentication (login, register, change-password) |
| `/api/patients` | Patient CRUD |
| `/api/doctors` | Doctor profiles |
| `/api/appointments` | Appointments |
| `/api/medical-records` | EMR |
| `/api/bills` | Billing & payments |
| `/api/lab` | Lab tests & requests |
| `/api/pharmacy` | Medicines & dispensing |
| `/api/inpatient` | Wards, beds, admissions |
| `/api/staff` | Staff management |
| `/api/hr` | Attendance & leaves |
| `/api/schedules` | Doctor schedules |
| `/api/documents` | Patient documents |
| `/api/reports` | Analytical reports |
| `/api/audit` | Audit logs |
| `/api/backups` | Backup management |
| `/api/dashboard` | Dashboard stats |

---

## Security

- Passwords are hashed with **bcryptjs** (10 salt rounds).
- All protected routes require a valid **JWT Bearer token**.
- Tokens expire after **5 hours**; the frontend enforces a **30-minute inactivity timeout** with a warning toast at the 28-minute mark.
- CORS is restricted to `FRONTEND_URL` in production.
- `.env` files are excluded from version control via `.gitignore`.

---

## ⚠️ Demo Data Disclaimer

> All users, patients, appointments, and other data seeded by `prisma/seed.js` are **entirely fictional and for demonstration purposes only**.
>
> **Before any real-world use:**
> - Delete or change all demo accounts via the Admin panel.
> - Replace `JWT_SECRET` and `DATABASE_URL` with your own secrets.
> - Review and configure role-based access to match your organisation's policies.
> - Do NOT deploy this system with demo credentials still active.

---

*Built with ❤️ — MediCare HMS*
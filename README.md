# Dayflow — HR Management System

Every workday, perfectly aligned.

A full-stack HRMS built for the Odoo x NMIT Hackathon 2026. Covers role-based auth, employee profiles, attendance check-in/out, leave applications with approval workflow, and payroll visibility.

## Stack
- **Frontend:** React (Vite) + React Router
- **Backend:** Node.js + Express
- **Database:** SQLite (local file, `better-sqlite3`) — real, persistent, dynamic data with zero setup
- **Auth:** JWT + bcrypt password hashing

## Project Structure
```
dayflow/
├── backend/          Express API + SQLite DB
│   ├── db.js         Schema + seed admin user
│   ├── middleware.js JWT auth + role guard
│   ├── routes/        auth, employees, attendance, leaves
│   └── server.js
└── frontend/         React app
    └── src/
        ├── pages/      Login, Signup, dashboards, profile, attendance, leaves
        ├── components/ Navbar, Badge, ProtectedRoute
        ├── api.js      API client
        └── AuthContext.jsx
```

## Running Locally

**1. Backend** (runs on http://localhost:5000)
```bash
cd backend
npm install
npm start
```
This auto-creates `dayflow.db` and seeds a default admin:
- Email: `admin@dayflow.com`
- Password: `Admin@123`

**2. Frontend** (runs on http://localhost:5173)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — sign in as the seeded admin, or sign up as a new Employee.

## Features Implemented
- ✅ Sign up / Sign in with role selection (Employee / Admin), password rules, robust input validation
- ✅ JWT-based auth + role-based route protection (frontend + backend)
- ✅ Employee dashboard with quick-access cards + recent leave activity
- ✅ Admin dashboard: employee list, inline edit (dept, designation, salary)
- ✅ Profile view/edit (employees edit phone/address/photo; admin edits everything)
- ✅ Attendance check-in / check-out, daily status, 7-day / 30-record history
- ✅ Admin attendance view by date, across all employees
- ✅ Leave application (Paid / Sick / Unpaid) with date range + remarks
- ✅ Admin leave approval/rejection with comments — approved leave auto-marks attendance as "Leave"
- ✅ Payroll: read-only for employees, editable by admin

## Not Yet Built (documented as future work)
- Email verification on signup
- Email/push notifications
- Analytics dashboard & salary-slip/attendance report exports

## API Overview
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| GET/PUT | /api/employees/me | Logged-in user |
| GET | /api/employees | Admin |
| PUT | /api/employees/:id | Admin |
| POST | /api/attendance/checkin, /checkout | Logged-in user |
| GET | /api/attendance/me | Logged-in user |
| GET | /api/attendance | Admin |
| POST | /api/leaves | Logged-in user |
| GET | /api/leaves/me | Logged-in user |
| GET/PUT | /api/leaves | Admin |

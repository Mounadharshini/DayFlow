# ElyVia — Human Resource Management System (HRMS)

> Every workday, perfectly aligned with executive precision.

**ElyVia** is a state-of-the-art, high-performance Human Resource Management System built with **React, Vite, Node.js, Express, and MySQL/JSON Engine**. It delivers comprehensive workforce administration, real-time attendance logging, multi-stage leave approvals with double-confirmation safety, payroll structure matrices with printable paystubs, photo upload/live camera integration, and executive analytics reporting.

---

## 🌟 Key Features

### 👑 1. HR Admin Control Center & Multi-Page Suite
- **Dedicated Route Architecture**: Separate, non-blending pages for every administrative function:
  - `/admin` — HR Control Center & Workforce Overview
  - `/admin/employees` — Employee Directory & Profile Manager
  - `/admin/attendance` — Workforce Attendance Logs
  - `/admin/leaves` — Real-Time Leave Approvals Queue
  - `/admin/payroll` — Payroll Matrix & Paystub Generator
  - `/admin/notifications` — HR Admin Real-Time Notification Center
  - `/analytics` — Executive Reports & HR Analytics Suite
- **360° Employee Switcher**: 1-click interactive drawer allowing HR Admins to inspect and switch between any employee profile across the organization.

### 🛡️ 2. Double-Confirmation Safety Engine
- **Mandatory Decision Confirmation**: Every leave approval or rejection action requires a secondary confirmation modal displaying the employee's request details, date range, and HR comment to eliminate accidental clicks.

### 📸 3. Base64 Avatar & Live Camera Integration
- **Device Library & Webcam Capture**: Employees can upload profile pictures directly from their device or take a live picture using their webcam.
- **Persistent Database Storage**: Photos are encoded as Base64 Data URLs, saved to MySQL/JSON store, and persist across refresh and re-login. Includes a full-screen Lightbox viewer and Delete Photo support.

### 🌴 4. Real-Time Leave Workflows & Notifications
- **Leave Application**: Employees apply with automatic day count calculation and real-time quota tracking (*Casual*, *Sick*, *Paid*).
- **Admin Review Inspector**: Notifications feed includes a dedicated **View / Review** modal allowing HR Admins to review request contents and issue inline approvals/rejections with custom feedback comments.

### 💰 5. Salary Structure & Printable Paystubs
- **Formula-Validated Breakdown**: Configurable Basic Salary (50%), HRA (25%), Allowances (25%), PF (12%), and Tax deductions.
- **Official Payout Slip Generator**: Clean, printable salary slips ready for PDF export or executive printing.
- **Side-by-Side Action Bar**: `+ Issue Salary Slip` sits side-by-side right next to `Refresh Sync`.

### 📊 6. Executive Reports & Analytics Suite
- **Interactive Visualizers**: 7-day attendance trend bar chart, department headcount breakdown, leave resolution ratios, and active workforce KPIs.
- **Reporting Tools**: One-click **Export Report (CSV)** and printable PDF layouts.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, React Router 7, Lucide Icons, Vanilla CSS (Cream & Espresso Palette)
- **Backend**: Node.js, Express 5, JWT Authentication, bcryptjs, Nodemailer SMTP
- **Database Engine**: MySQL / High-Performance File Database Engine with JSON persistence

---

## 🚀 Getting Started

### 1. Start the Backend Server (Port 5000)
```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **HR Admin 👑** | `admin@elyvia.com` | `Admin@123` |
| **Employee** | `alex.morgan@company.com` | `Employee@123` |

---

© 2026 **ElyVia HRMS**. All rights reserved.

# ElyVia — Human Resource Management System (HRMS)

> *Every workday, perfectly aligned.*

**ElyVia** is an enterprise-grade, modern Human Resource Management System built with React, Vite, Node.js, Express, and Lucide React. It provides real-time role-based workforce management, live attendance clocking, double-confirmation leave approval workflows, payroll breakdown with printable paystubs, real-time admin notification handling, base64 photo persistence, and executive analytics reporting.

---

## 🌟 Key Features

### 👑 1. HR Administration & Employee Management
- **Dedicated Page Navigation**: Distinct dedicated routes for each HR module:
  - `/admin`: HR Control Center Dashboard
  - `/admin/employees`: Organization Employee Directory & Manager
  - `/admin/attendance`: Workforce Attendance Logs
  - `/admin/leaves`: Real-Time Leave Approval Queue
  - `/admin/payroll`: Payroll Matrix & Salary Structure Configurator
  - `/admin/notifications`: Real-Time HR Notifications Center
  - `/analytics`: Executive HR Analytics Suite
- **Employee Roster**: Full CRUD employee management with search, filtering, salary structure updates, and account creation.
- **360° Switcher Drawer**: Quick 1-click inspection drawer to preview employee account states.

### 🛡️ 2. Double Confirmation Approval Engine
- **Mandatory Safety Checks**: Double-confirmation popup modals for every single leave request approval or rejection across all Admin pages.
- **HR Commenting**: Issue feedback comments directly to employees upon approving or rejecting requests.
- **Real-Time Notification Dispatch**: Approving or rejecting a request automatically updates the database and sends instant notifications to the employee.

### 👤 3. Employee Profile & Base64 Photo Storage
- **Editable Employee Profile**: Logged-in employees can update address, phone number, and profile photos.
- **Device File Picker & Live Webcam Capture**: Upload photos from local library or capture photos directly via web camera.
- **Database Persistence**: Saved photos persist across page refreshes, logouts, and re-logins.
- **Full-Screen Lightbox**: View profile photos in high-resolution lightbox modals with 1-click photo deletion.
- **Admin Shield Icon**: HR Admin accounts display official gold Admin Shield badges.

### ⏱️ 4. Attendance Tracking & Work Hours Engine
- **Punch In / Punch Out**: Real-time duration counter tracking workday hours.
- **Attendance Matrix**: Filter logs by status (*Present*, *Half-day*, *Absent*, *On Leave*) across custom date ranges.

### 🌴 5. Leave & Time-Off Management
- **Apply for Leave**: Select leave type (*Casual*, *Sick*, *Paid*), date range picker with live day count calculation, and quota tracking.
- **Real-Time Sync**: Approved leaves automatically reflect on attendance calendars.

### 💰 6. Payroll Matrix & Printable Paystubs
- **Salary Configurator**: Configure basic salary, HRA, special allowances, PF deductions, and professional tax with live net payable formula validation.
- **Issue Salary Slips**: Generate official monthly paystubs in 1 click.
- **Printable Payslips**: Official ElyVia-branded payslips with Print / Save to PDF support.

### 📈 7. Executive HR Reports & Analytics
- **Live KPI Metrics**: Headcount, active attendance rate %, annual CTC budget, and pending leave counters.
- **7-Day Attendance Trend Chart**: Visual breakdown of workforce attendance over time.
- **Export Suite**: Export analytics summary to CSV or print executive PDF reports.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, React Router 7, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express 5, JWT Authentication, bcryptjs, Nodemailer SMTP
- **Database**: Pure JS Persistent File Database Engine (MySQL API ready)

---

## 🚀 Running Locally

### 1. Start Backend Server (Port 5000)
```bash
cd backend
npm install
npm start
```

### 2. Start Frontend App (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your web browser.

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **HR Admin 👑** | `admin@elyvia.com` | `Admin@123` |
| **Employee** | `alex.morgan@company.com` | `Emp@123456` |

---

## 🔒 Security & Privacy Notes

- All `.env` environment files and `node_modules` are strictly excluded from git tracking.
- Passwords are salted and hashed using bcrypt (`bcryptjs`).

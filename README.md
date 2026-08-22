# Dayflow — Human Resource Management System (HRMS)

> Every workday, perfectly aligned.

A complete, modern Human Resource Management System built with React, Vite, Node.js, Express, and Lucide React. Supports role-based access for HR Admins and Employees, daily attendance tracking, leave approval workflows, payroll breakdown with printable paystubs, email verification, in-app notifications, and HR analytics.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **Sign Up**: Employee ID registration, full name, work email validation, role selection (*Employee* / *HR Admin*), and password security enforcement (minimum 8 characters, letters, and numbers).
- **Email Verification**: Simulated 6-digit OTP code generation, dashboard verification banner, and instant verification status confirmation.
- **Sign In**: Role-based access control with automatic dashboard routing (`/admin` vs `/dashboard`).
- **Demo Persona Buttons**: 1-click login buttons for instant testing as HR Admin or Employee.

### 📊 2. Role-Based Dashboards & 360° Inspector
- **Employee Dashboard**: Live system clock, daily Punch-In / Punch-Out widget, leave balance counters, monthly net salary card, and recent leave activity timeline.
- **HR Admin Dashboard**: Key workforce metrics, annual gross payroll budget, searchable employee directory with inline salary structure editor, and an **Open 360° Employee Inspector** drawer.

### 👤 3. Profile & Document Management
- **5-Tab Profile Hub**: Overview, Job Info, Compensation Breakdown (Basic, HRA, Allowances), Document Attachments, and Contact Info Edit.
- **Document Manager**: Attach personnel files (Contracts, ID proofs, Certificates, Tax forms) with file size indicators and removal options.

### ⏱️ 4. Attendance Management
- **Work Hours Tracking**: Real-time Punch-In / Punch-Out with elapsed duration counter.
- **History & Range Filters**: 7-day, 30-day, and custom date range attendance logs.
- **Organization Matrix**: Date picker for HR Admins to inspect attendance across all employees for any day.

### 🌴 5. Leave & Time-Off Workflows
- **Apply for Leave**: Select leave type (*Paid*, *Sick*, *Unpaid*), date range picker with live day count calculation, remarks, and quota balance checking.
- **Admin Approval Queue**: Filter queue by status (*Pending*, *Approved*, *Rejected*, *All*), add HR feedback comments, and single-click Approve / Reject.
- **Automated Sync**: Approving a leave request automatically updates employee leave balances and sets the attendance matrix status for those dates to "Leave".

### 💰 6. Payroll & Printable Paystubs
- **Employee View**: Read-only monthly gross salary, PF & Tax deductions, net take-home pay, and direct bank disbursement details.
- **Admin View**: Organization-wide salary directory, total monthly gross and net disbursement totals, inline salary structure editor.
- **Printable Paystub Modal**: Official company-formatted salary slip with Print / Save as PDF support.

### 📈 7. HR Analytics & Notifications
- **Analytics Dashboard**: 7-day attendance distribution bar charts, departmental workforce breakdown percentages, pending leave counter, monthly payout projections, and exportable CSV attendance reports.
- **In-App Notifications**: Popover bell icon in navbar with unread counter badges and real-time event updates.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 8, React Router 7, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express 5, JWT Authentication, bcryptjs
- **Database**: Pure JS Persistent Database Store (JSON-backed SQLite API compatible)

---

## 🚀 Running Locally

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
| **HR Admin** | `admin@dayflow.com` | `Admin@123` |
| **Employee** | `alex.morgan@dayflow.com` | `Employee@123` |

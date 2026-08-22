import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import AdminDashboard from './pages/AdminDashboard';
import AdminAttendance from './pages/AdminAttendance';
import AdminLeaves from './pages/AdminLeaves';
import ReportsAnalytics from './pages/ReportsAnalytics';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><EmployeeDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AppLayout><Attendance /></AppLayout></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute><AppLayout><Leaves /></AppLayout></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><AppLayout><Payroll /></AppLayout></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute adminOnly><AppLayout><AdminAttendance /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/leaves" element={<ProtectedRoute adminOnly><AppLayout><AdminLeaves /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute adminOnly><AppLayout><ReportsAnalytics /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

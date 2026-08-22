const BASE_URL = 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  // Auth & Verification
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  googleAuth: (payload) => request('/auth/google', { method: 'POST', body: payload }),
  sendVerifyEmail: (token) => request('/auth/verify-send', { method: 'POST', token }),
  confirmVerifyEmail: (token, otp) => request('/auth/verify-confirm', { method: 'POST', body: { otp }, token }),

  // Employee Profile & Documents
  getMyProfile: (token) => request('/employees/me', { token }),
  updateMyProfile: (token, payload) => request('/employees/me', { method: 'PUT', body: payload, token }),
  addDocument: (token, payload) => request('/employees/me/documents', { method: 'POST', body: payload, token }),
  deleteDocument: (token, docId) => request(`/employees/me/documents/${docId}`, { method: 'DELETE', token }),
  getAllEmployees: (token) => request('/employees', { token }),
  getEmployee: (token, id) => request(`/employees/${id}`, { token }),
  updateEmployee: (token, id, payload) => request(`/employees/${id}`, { method: 'PUT', body: payload, token }),

  // Attendance
  checkIn: (token) => request('/attendance/checkin', { method: 'POST', token }),
  checkOut: (token) => request('/attendance/checkout', { method: 'POST', token }),
  getMyAttendance: (token, range) => request(`/attendance/me${range ? `?range=${range}` : ''}`, { token }),
  getAllAttendance: (token, params = '') => request(`/attendance${params}`, { token }),

  // Leaves
  applyLeave: (token, payload) => request('/leaves', { method: 'POST', body: payload, token }),
  getMyLeaves: (token) => request('/leaves/me', { token }),
  getAllLeaves: (token, status) => request(`/leaves${status ? `?status=${status}` : ''}`, { token }),
  updateLeave: (token, id, payload) => request(`/leaves/${id}`, { method: 'PUT', body: payload, token }),

  // Payroll
  getMyPaystub: (token) => request('/payroll/me', { token }),
  getAllPayrolls: (token) => request('/payroll', { token }),

  // Analytics & Notifications
  getAnalytics: (token) => request('/analytics', { token }),
  getNotifications: (token) => request('/notifications', { token }),
  markNotificationsRead: (token) => request('/notifications/mark-read', { method: 'PUT', token }),
};

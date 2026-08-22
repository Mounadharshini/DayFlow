const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET, auth } = require('../middleware');

const router = express.Router();

function isValidPassword(pw) {
  return typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/signup', (req, res) => {
  const { employeeId, name, email, password, role } = req.body;

  if (!employeeId || !name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['Admin', 'Employee'].includes(role)) {
    return res.status(400).json({ error: 'Role must be Admin or Employee' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and contain both letters and numbers' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR employeeId = ?').get(email, employeeId);
  if (existing) {
    return res.status(409).json({ error: 'Employee ID or email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const info = db.prepare(`INSERT INTO users (employeeId, name, email, password, role, isEmailVerified, otpCode) VALUES (?,?,?,?,?,?,?)`)
    .run(employeeId, name, email, hash, role, 0, otp);

  // Send initial welcome notification
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(info.lastInsertRowid, 'Welcome to Dayflow HRMS!', `Your account has been created. Please verify your email with OTP code: ${otp}`, 'info');

  const user = db.prepare('SELECT id, employeeId, name, email, role, isEmailVerified, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user, demoOtp: otp });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
  const { password: _pw, otpCode: _otp, ...safeUser } = user;

  // Parse documents JSON safely
  try {
    safeUser.documents = JSON.parse(safeUser.documents || '[]');
  } catch (e) {
    safeUser.documents = [];
  }

  res.json({ token, user: safeUser });
});

// Request email verification OTP
router.post('/verify-send', auth, (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  db.prepare('UPDATE users SET otpCode = ? WHERE id = ?').run(otp, req.user.id);

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.user.id, 'Verification Code Sent', `Your email verification OTP is ${otp}`, 'warning');

  res.json({ message: 'Verification OTP sent to email', demoOtp: otp });
});

// Confirm email verification OTP
router.post('/verify-confirm', auth, (req, res) => {
  const { otp } = req.body;
  const user = db.prepare('SELECT otpCode FROM users WHERE id = ?').get(req.user.id);
  if (!user || user.otpCode !== otp) {
    return res.status(400).json({ error: 'Invalid or expired verification code' });
  }

  db.prepare('UPDATE users SET isEmailVerified = 1, otpCode = "" WHERE id = ?').run(req.user.id);

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.user.id, 'Email Verified', 'Your email address has been successfully verified!', 'success');

  const updatedUser = db.prepare('SELECT id, employeeId, name, email, role, isEmailVerified FROM users WHERE id = ?').get(req.user.id);
  res.json({ message: 'Email successfully verified', user: updatedUser });
});

module.exports = router;

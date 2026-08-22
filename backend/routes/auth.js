const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET, auth } = require('../middleware');
const { sendMail } = require('../mailer');

const router = express.Router();

function isValidPassword(pw) {
  return typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/signup', async (req, res) => {
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

  // Send initial welcome notification in app
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(info.lastInsertRowid, 'Welcome to Dayflow HRMS!', `Your account has been created. Verification OTP code: ${otp}`, 'info');

  // Send real email via Gmail SMTP
  sendMail({
    to: email,
    subject: 'Dayflow HRMS — Welcome & Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #4f46e5; margin-bottom: 4px;">Welcome to Dayflow HRMS!</h2>
        <p style="color: #64748b; font-size: 14px;">Every workday, perfectly aligned.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering your account (Employee ID: <strong>${employeeId}</strong>). Please use the 6-digit verification code below to verify your email address:</p>
        <div style="background: #eef2ff; color: #4f46e5; font-size: 28px; font-weight: 800; letter-spacing: 6px; padding: 16px; text-align: center; border-radius: 10px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #64748b;">If you did not register for Dayflow HRMS, please ignore this email.</p>
      </div>
    `
  }).catch(() => {});

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

  try {
    safeUser.documents = JSON.parse(safeUser.documents || '[]');
  } catch (e) {
    safeUser.documents = [];
  }

  res.json({ token, user: safeUser });
});

// Request email verification OTP
router.post('/verify-send', async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  db.prepare('UPDATE users SET otpCode = ? WHERE id = ?').run(otp, req.user.id);

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.user.id, 'Verification Code Sent', `Your email verification OTP is ${otp}`, 'warning');

  const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(req.user.id);

  // Send real email via Gmail SMTP
  if (user) {
    sendMail({
      to: user.email,
      subject: 'Dayflow HRMS — Your Verification OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h3 style="color: #4f46e5;">Email Verification Request</h3>
          <p>Hello ${user.name}, your verification OTP code is:</p>
          <div style="background: #eef2ff; color: #4f46e5; font-size: 28px; font-weight: 800; letter-spacing: 6px; padding: 16px; text-align: center; border-radius: 10px; margin: 20px 0;">
            ${otp}
          </div>
        </div>
      `
    }).catch(() => {});
  }

  res.json({ message: 'Verification OTP sent to email', demoOtp: otp });
});

// Confirm email verification OTP
router.post('/verify-confirm', (req, res) => {
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

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

// Helper to decode Google JWT ID Token if sent
function parseGoogleCredential(credential) {
  if (!credential) return null;
  try {
    const parts = credential.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return {
        email: payload.email,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        picture: payload.picture || ''
      };
    }
  } catch (e) {}
  return null;
}

function buildOTPEmailHTML(name, employeeId, otp) {
  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border-radius: 20px; background-color: #fcfaf7; border: 1px solid #eee5d8; color: #2b1b12;">
      <!-- Brand Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 2px dashed #eee5d8; margin-bottom: 28px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="background: linear-gradient(135deg, #b37a4c 0%, #9c6137 100%); color: white; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px;">
            EV
          </div>
          <div>
            <span style="font-size: 24px; font-weight: 800; color: #2b1b12; letter-spacing: -0.5px;">ElyVia</span>
            <div style="font-size: 11px; font-weight: 700; color: #b37a4c; letter-spacing: 0.08em;">HUMAN RESOURCE SYSTEM</div>
          </div>
        </div>
      </div>

      <!-- Main Body -->
      <h2 style="color: #2b1b12; font-size: 22px; font-weight: 800; margin-bottom: 10px;">Email Verification Code</h2>
      <p style="color: #7a6758; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Hello <strong>${name}</strong>,<br/>
        Welcome to ElyVia HRMS! Your account (Employee ID: <strong>${employeeId || 'Staff'}</strong>) has been registered. Please use the official 6-digit OTP security code below to verify your email address:
      </p>

      <!-- OTP Code Box -->
      <div style="background: linear-gradient(135deg, #cc9966 0%, #9c6137 100%); color: #ffffff; padding: 24px; border-radius: 16px; text-align: center; margin: 28px 0; box-shadow: 0 8px 24px rgba(156, 97, 55, 0.25);">
        <div style="font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; opacity: 0.9;">YOUR 6-DIGIT VERIFICATION CODE</div>
        <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${otp}</div>
      </div>

      <p style="color: #7a6758; font-size: 14px; margin-bottom: 32px;">
        This code is valid for 10 minutes. Click the actions below to access your ElyVia workspace:
      </p>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 14px; margin: 28px 0; flex-wrap: wrap;">
        <a href="http://localhost:5173/dashboard" style="background: linear-gradient(135deg, #b37a4c 0%, #9c6137 100%); color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(179, 122, 76, 0.3);">
          Verify Email Address &rarr;
        </a>
        <a href="http://localhost:5173" style="background: #ffffff; color: #2b1b12; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; border: 1px solid #eee5d8; display: inline-block;">
          Launch ElyVia App
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #eee5d8; padding-top: 20px; font-size: 12px; color: #9c8b7c; text-align: center;">
        Sent securely by <strong>ElyVia HRMS Platform</strong> &bull; dhachumaa182@gmail.com<br/>
        If you did not request this verification code, please ignore this email.
      </div>
    </div>
  `;
}

// Signup (Public registrations are ALWAYS Employee role)
router.post('/signup', async (req, res) => {
  const { employeeId, name, email, password } = req.body;

  if (!employeeId || !name || !email || !password) {
    return res.status(400).json({ error: 'Employee ID, Name, Email, and Password are required' });
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
  const role = 'Employee';

  const info = db.prepare(`INSERT INTO users (employeeId, name, email, password, role, isEmailVerified, otpCode) VALUES (?,?,?,?,?,?,?)`)
    .run(employeeId, name, email, hash, role, 0, otp);

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(info.lastInsertRowid, 'Welcome to ElyVia HRMS!', `Your account has been created. Verification OTP code: ${otp}`, 'info');

  sendMail({
    to: email,
    subject: 'ElyVia HRMS — Welcome & Email Verification OTP',
    html: buildOTPEmailHTML(name, employeeId, otp)
  }).catch(() => {});

  const user = db.prepare('SELECT id, employeeId, name, email, role, isEmailVerified, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, user, demoOtp: otp });
});

// Standard Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user && (email === 'admin@elyvia.com' || email === 'admin@dayflow.com')) {
    user = db.prepare('SELECT * FROM users WHERE role = "Admin"').get();
  }

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

// Google OAuth Sign In / Sign Up Handler
router.post('/google', (req, res) => {
  let email = req.body.email;
  let name = req.body.name;
  let picture = req.body.picture;

  if (req.body.credential) {
    const parsed = parseGoogleCredential(req.body.credential);
    if (parsed) {
      email = parsed.email;
      name = parsed.name;
      picture = parsed.picture;
    }
  }

  if (!email) {
    return res.status(400).json({ error: 'Google authentication failed. No valid email received.' });
  }

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    const empId = 'EMP-G' + Math.floor(100 + Math.random() * 900);
    const hash = bcrypt.hashSync(Math.random().toString(36), 10);
    const role = 'Employee';

    const info = db.prepare(`INSERT INTO users (employeeId, name, email, password, role, isEmailVerified, profilePicture) VALUES (?,?,?,?,?,?,?)`)
      .run(empId, name || email.split('@')[0], email, hash, role, 1, picture || '');

    db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
      .run(info.lastInsertRowid, 'Account Created via Google', 'Welcome to ElyVia HRMS! Your Google account has been linked.', 'success');

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  } else {
    if (!user.isEmailVerified) {
      db.prepare('UPDATE users SET isEmailVerified = 1 WHERE id = ?').run(user.id);
      user.isEmailVerified = 1;
    }
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

  const user = db.prepare('SELECT name, email, employeeId FROM users WHERE id = ?').get(req.user.id);

  if (user) {
    sendMail({
      to: user.email,
      subject: 'ElyVia HRMS — Your Email Verification Code',
      html: buildOTPEmailHTML(user.name, user.employeeId, otp)
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

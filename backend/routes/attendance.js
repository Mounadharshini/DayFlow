const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware');

const router = express.Router();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 8);
}

function calcHours(inTimeStr, outTimeStr) {
  if (!inTimeStr || !outTimeStr) return 8.0;
  const [h1, m1] = inTimeStr.split(':').map(Number);
  const [h2, m2] = outTimeStr.split(':').map(Number);
  const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
  return diffMins > 0 ? parseFloat((diffMins / 60).toFixed(1)) : 8.0;
}

// Employee check-in (Validates duplicate check-in)
router.post('/checkin', auth, (req, res) => {
  const activeUserId = req.user?.id || req.user?.userId;
  const date = todayStr();
  const existing = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date = ?').get(activeUserId, date);
  if (existing && existing.checkIn) {
    return res.status(400).json({ error: 'Already checked in today' });
  }

  const time = nowTime();
  if (existing) {
    db.prepare('UPDATE attendance SET checkIn = ?, status = ? WHERE id = ?').run(time, 'Present', existing.id);
  } else {
    db.prepare('INSERT INTO attendance (userId, date, status, checkIn) VALUES (?,?,?,?)').run(activeUserId, date, 'Present', time);
  }

  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(activeUserId) || { name: req.user?.name || 'An Employee' };

  // 1. Notify Requesting Employee
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(activeUserId, 'Check-In Success ⏱️', `Checked in today at ${time}`, 'success');

  // 2. Notify ALL Admin Users in Database
  const admins = db.prepare(`SELECT id FROM users WHERE role = 'Admin'`).all() || [];
  admins.forEach(admin => {
    db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
      .run(admin.id, '⏱️ Employee Check-In Alert', `${user.name} checked in today at ${time}.`, 'info');
  });

  const record = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date = ?').get(activeUserId, date);
  res.json(record);
});

// Employee check-out (Validates check-in existence and duplicate check-out)
router.post('/checkout', auth, (req, res) => {
  const activeUserId = req.user?.id || req.user?.userId;
  const date = todayStr();
  const existing = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date = ?').get(activeUserId, date);
  if (!existing || !existing.checkIn) {
    return res.status(400).json({ error: 'You must check in before checking out' });
  }
  if (existing.checkOut) {
    return res.status(400).json({ error: 'Already checked out today' });
  }

  const outTime = nowTime();
  const hours = calcHours(existing.checkIn, outTime);

  db.prepare('UPDATE attendance SET checkOut = ?, workHours = ? WHERE id = ?').run(outTime, hours, existing.id);

  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(activeUserId) || { name: req.user?.name || 'An Employee' };

  // 1. Notify Requesting Employee
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(activeUserId, 'Check-Out Completed 👋', `Checked out at ${outTime}. Total logged duration: ${hours} hrs`, 'info');

  // 2. Notify ALL Admin Users in Database
  const admins = db.prepare(`SELECT id FROM users WHERE role = 'Admin'`).all() || [];
  admins.forEach(admin => {
    db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
      .run(admin.id, '👋 Employee Check-Out Alert', `${user.name} checked out at ${outTime} (${hours} hrs).`, 'info');
  });

  const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
  res.json(record);
});

// Employee: view own attendance (Role security enforced)
router.get('/me', auth, (req, res) => {
  const activeUserId = req.user?.id || req.user?.userId;
  const { range } = req.query;
  let rows;
  if (range === 'week') {
    const d = new Date();
    const start = new Date(d.setDate(d.getDate() - 7)).toISOString().slice(0, 10);
    rows = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date >= ? ORDER BY date DESC').all(activeUserId, start);
  } else if (range === 'month') {
    const d = new Date();
    const start = new Date(d.setDate(d.getDate() - 30)).toISOString().slice(0, 10);
    rows = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date >= ? ORDER BY date DESC').all(activeUserId, start);
  } else {
    rows = db.prepare('SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC LIMIT 60').all(activeUserId);
  }
  res.json(rows || []);
});

// Admin: view all attendance for a date, month, or specific employee (requireAdmin enforced)
router.get('/', auth, requireAdmin, (req, res) => {
  const { date, userId } = req.query;
  let rows;
  if (userId) {
    rows = db.prepare(`
      SELECT a.*, u.name, u.employeeId, u.department FROM attendance a
      JOIN users u ON u.id = a.userId
      WHERE a.userId = ? ORDER BY a.date DESC LIMIT 60`).all(userId);
  } else {
    const d = date || todayStr();
    rows = db.prepare(`
      SELECT a.*, u.name, u.employeeId, u.department FROM attendance a
      JOIN users u ON u.id = a.userId
      WHERE a.date = ? ORDER BY u.name`).all(d);
  }
  res.json(rows || []);
});

// Admin: Update / Correct Attendance Record for Employee
router.put('/:id', auth, requireAdmin, (req, res) => {
  const { status, checkIn, checkOut, workHours } = req.body;
  const existing = db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Attendance record not found' });
  }

  const finalStatus = status || existing.status;
  const finalCheckIn = checkIn !== undefined ? checkIn : existing.checkIn;
  const finalCheckOut = checkOut !== undefined ? checkOut : existing.checkOut;
  const finalHours = workHours !== undefined ? Number(workHours) : calcHours(finalCheckIn, finalCheckOut);

  db.prepare('UPDATE attendance SET status = ?, checkIn = ?, checkOut = ?, workHours = ? WHERE id = ?')
    .run(finalStatus, finalCheckIn, finalCheckOut, finalHours, req.params.id);

  // Trigger Real-Time Notification to Employee
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(
      existing.userId,
      '⏱️ Attendance Record Updated',
      `HR Admin updated your attendance record for ${existing.date} to ${finalStatus} (${finalHours} hrs).`,
      'info'
    );

  const updated = db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id);
  res.json(updated);
});

module.exports = router;

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

// Employee check-in
router.post('/checkin', auth, (req, res) => {
  const date = todayStr();
  const existing = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date = ?').get(req.user.id, date);
  if (existing && existing.checkIn) {
    return res.status(400).json({ error: 'Already checked in today' });
  }

  const time = nowTime();
  if (existing) {
    db.prepare('UPDATE attendance SET checkIn = ?, status = ? WHERE id = ?').run(time, 'Present', existing.id);
  } else {
    db.prepare('INSERT INTO attendance (userId, date, status, checkIn) VALUES (?,?,?,?)').run(req.user.id, date, 'Present', time);
  }

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.user.id, 'Check-In Success', `Checked in today at ${time}`, 'success');

  const record = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date = ?').get(req.user.id, date);
  res.json(record);
});

// Employee check-out
router.post('/checkout', auth, (req, res) => {
  const date = todayStr();
  const existing = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date = ?').get(req.user.id, date);
  if (!existing || !existing.checkIn) {
    return res.status(400).json({ error: 'You must check in before checking out' });
  }
  if (existing.checkOut) {
    return res.status(400).json({ error: 'Already checked out today' });
  }

  const outTime = nowTime();
  const hours = calcHours(existing.checkIn, outTime);

  db.prepare('UPDATE attendance SET checkOut = ?, workHours = ? WHERE id = ?').run(outTime, hours, existing.id);

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.user.id, 'Check-Out Completed', `Checked out at ${outTime}. Total logged duration: ${hours} hrs`, 'info');

  const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
  res.json(record);
});

// Employee: view own attendance
router.get('/me', auth, (req, res) => {
  const { range } = req.query;
  let rows;
  if (range === 'week') {
    const d = new Date();
    const start = new Date(d.setDate(d.getDate() - 7)).toISOString().slice(0, 10);
    rows = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date >= ? ORDER BY date DESC').all(req.user.id, start);
  } else if (range === 'month') {
    const d = new Date();
    const start = new Date(d.setDate(d.getDate() - 30)).toISOString().slice(0, 10);
    rows = db.prepare('SELECT * FROM attendance WHERE userId = ? AND date >= ? ORDER BY date DESC').all(req.user.id, start);
  } else {
    rows = db.prepare('SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC LIMIT 60').all(req.user.id);
  }
  res.json(rows);
});

// Admin: view all attendance for a date or specific employee
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
  res.json(rows);
});

module.exports = router;

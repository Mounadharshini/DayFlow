const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware');

const router = express.Router();

function getDaysBetween(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Employee: apply for leave
router.post('/', auth, (req, res) => {
  const { type, startDate, endDate, remarks } = req.body;
  if (!type || !startDate || !endDate) {
    return res.status(400).json({ error: 'Leave type, start date and end date are required' });
  }
  if (!['Paid', 'Sick', 'Unpaid'].includes(type)) {
    return res.status(400).json({ error: 'Invalid leave type' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'End date cannot be before start date' });
  }

  const daysCount = getDaysBetween(startDate, endDate);

  // Check remaining balances
  const user = db.prepare('SELECT paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(req.user.id);
  if (type === 'Paid' && user.paidLeaveRemaining < daysCount) {
    return res.status(400).json({ error: `Insufficient Paid Leave balance. Requested ${daysCount} days, remaining ${user.paidLeaveRemaining} days.` });
  }
  if (type === 'Sick' && user.sickLeaveRemaining < daysCount) {
    return res.status(400).json({ error: `Insufficient Sick Leave balance. Requested ${daysCount} days, remaining ${user.sickLeaveRemaining} days.` });
  }

  const info = db.prepare(`INSERT INTO leaves (userId, type, startDate, endDate, daysCount, remarks) VALUES (?,?,?,?,?,?)`)
    .run(req.user.id, type, startDate, endDate, daysCount, remarks || '');

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.user.id, 'Leave Request Submitted', `Your ${type} leave request (${startDate} to ${endDate}, ${daysCount} days) is pending approval.`, 'info');

  const leave = db.prepare('SELECT * FROM leaves WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(leave);
});

// Employee: view own leave requests + balance
router.get('/me', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM leaves WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
  const user = db.prepare('SELECT paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(req.user.id);
  res.json({ leaves: rows, balances: user });
});

// Admin: view all leave requests
router.get('/', auth, requireAdmin, (req, res) => {
  const { status } = req.query;
  let rows;
  if (status && status !== 'All') {
    rows = db.prepare(`
      SELECT l.*, u.name, u.employeeId, u.department FROM leaves l
      JOIN users u ON u.id = l.userId
      WHERE l.status = ? ORDER BY l.createdAt DESC`).all(status);
  } else {
    rows = db.prepare(`
      SELECT l.*, u.name, u.employeeId, u.department FROM leaves l
      JOIN users u ON u.id = l.userId
      ORDER BY l.createdAt DESC`).all();
  }
  res.json(rows);
});

// Admin: approve or reject
router.put('/:id', auth, requireAdmin, (req, res) => {
  const { status, adminComment } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Approved or Rejected' });
  }
  const leave = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });

  db.prepare('UPDATE leaves SET status = ?, adminComment = ? WHERE id = ?').run(status, adminComment || '', req.params.id);

  if (status === 'Approved') {
    // Update balances
    const user = db.prepare('SELECT paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(leave.userId);
    if (leave.type === 'Paid') {
      const newBal = Math.max(0, user.paidLeaveRemaining - leave.daysCount);
      db.prepare('UPDATE users SET paidLeaveRemaining = ? WHERE id = ?').run(newBal, leave.userId);
    } else if (leave.type === 'Sick') {
      const newBal = Math.max(0, user.sickLeaveRemaining - leave.daysCount);
      db.prepare('UPDATE users SET sickLeaveRemaining = ? WHERE id = ?').run(newBal, leave.userId);
    }

    // Mark attendance as 'Leave'
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const existing = db.prepare('SELECT id FROM attendance WHERE userId = ? AND date = ?').get(leave.userId, dateStr);
      if (existing) {
        db.prepare('UPDATE attendance SET status = ? WHERE id = ?').run('Leave', existing.id);
      } else {
        db.prepare('INSERT INTO attendance (userId, date, status) VALUES (?,?,?)').run(leave.userId, dateStr, 'Leave');
      }
    }

    db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
      .run(leave.userId, 'Leave Approved 🎉', `Your ${leave.type} leave request (${leave.startDate} to ${leave.endDate}) has been approved!`, 'success');
  } else {
    db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
      .run(leave.userId, 'Leave Request Rejected', `Your ${leave.type} leave request (${leave.startDate} to ${leave.endDate}) was rejected. ${adminComment ? 'Reason: ' + adminComment : ''}`, 'danger');
  }

  const updated = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
  res.json(updated);
});

module.exports = router;

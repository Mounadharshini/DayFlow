const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware');
const { sendMail } = require('../mailer');

const router = express.Router();

function getDaysBetween(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Employee: apply for leave
router.post('/', auth, async (req, res) => {
  try {
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

    // Bulletproof User Resolution
    const activeUserId = req.user?.id || req.user?.userId;
    let user = db.prepare('SELECT * FROM users WHERE id = ?').get(activeUserId);
    if (!user && req.user?.email) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.user.email);
    }
    if (!user) {
      user = {
        id: activeUserId || 1,
        name: req.user?.name || 'Employee',
        email: req.user?.email || '',
        paidLeaveRemaining: 12,
        sickLeaveRemaining: 8
      };
    }

    const targetUserId = user.id || activeUserId;
    const paidBal = Number(user.paidLeaveRemaining) || 12;
    const sickBal = Number(user.sickLeaveRemaining) || 8;

    if (type === 'Paid' && paidBal < daysCount) {
      return res.status(400).json({ error: `Insufficient Paid Leave balance. Requested ${daysCount} days, remaining ${paidBal} days.` });
    }
    if (type === 'Sick' && sickBal < daysCount) {
      return res.status(400).json({ error: `Insufficient Sick Leave balance. Requested ${daysCount} days, remaining ${sickBal} days.` });
    }

    const info = db.prepare(`INSERT INTO leaves (userId, type, startDate, endDate, daysCount, remarks) VALUES (?,?,?,?,?,?)`)
      .run(targetUserId, type, startDate, endDate, daysCount, remarks || '');

    const leaveId = info.lastInsertRowid;

    // 1. Notify ALL Admin Users in Real-Time
    const admins = db.prepare(`SELECT id FROM users WHERE role = 'Admin'`).all() || [];
    admins.forEach(admin => {
      db.prepare(`INSERT INTO notifications (userId, title, message, type, leaveId) VALUES (?,?,?,?,?)`)
        .run(
          admin.id,
          '🔔 New Leave Request',
          `${user?.name || 'An Employee'} has submitted a leave request for ${type} from ${startDate} to ${endDate}.`,
          'warning',
          leaveId
        );
    });

    // 2. Notify Requesting Employee
    db.prepare(`INSERT INTO notifications (userId, title, message, type, leaveId) VALUES (?,?,?,?,?)`)
      .run(
        targetUserId, 
        'Leave Request Submitted', 
        `Your ${type} leave request (${startDate} to ${endDate}, ${daysCount} days) is pending approval.`, 
        'info',
        leaveId
      );

    if (user.email) {
      sendMail({
        to: user.email,
        subject: `ElyVia HRMS — Leave Request Submitted (${type})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee5d8; border-radius: 12px; background: #ffffff;">
            <h3 style="color: #b37a4c;">Leave Application Submitted</h3>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your request for <strong>${type} Leave</strong> (${daysCount} day(s) from ${startDate} to ${endDate}) has been submitted and is pending HR Admin approval.</p>
            <p style="font-size: 13px; color: #7a6758;">Remarks: ${remarks || 'None'}</p>
          </div>
        `
      }).catch(() => {});
    }

    const leave = db.prepare('SELECT * FROM leaves WHERE id = ?').get(leaveId);
    res.status(201).json(leave || { id: leaveId, userId: targetUserId, type, startDate, endDate, daysCount, remarks, status: 'Pending' });
  } catch (err) {
    console.error('Leave creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit leave request' });
  }
});

// Employee: view own leave requests + balance
router.get('/me', auth, (req, res) => {
  try {
    const activeUserId = req.user?.id || req.user?.userId;
    const rows = db.prepare('SELECT * FROM leaves WHERE userId = ? ORDER BY createdAt DESC').all(activeUserId) || [];
    let user = db.prepare('SELECT paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(activeUserId);
    if (!user && req.user?.email) {
      user = db.prepare('SELECT paidLeaveRemaining, sickLeaveRemaining FROM users WHERE email = ?').get(req.user.email);
    }
    res.json({ leaves: rows, balances: user || { paidLeaveRemaining: 12, sickLeaveRemaining: 8 } });
  } catch (err) {
    console.error('Get my leaves error:', err);
    res.status(500).json({ error: err.message || 'Failed to load leave records' });
  }
});

// Admin: view all leave requests
router.get('/', auth, requireAdmin, (req, res) => {
  try {
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
    res.json(rows || []);
  } catch (err) {
    console.error('Admin get leaves error:', err);
    res.status(500).json({ error: err.message || 'Failed to load leave queue' });
  }
});

// Admin: approve or reject
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected' });
    }
    const leave = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });

    const emp = db.prepare('SELECT name, email, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(leave.userId);

    db.prepare('UPDATE leaves SET status = ?, adminComment = ? WHERE id = ?').run(status, adminComment || '', req.params.id);

    if (status === 'Approved') {
      if (leave.type === 'Paid') {
        const newBal = Math.max(0, (emp?.paidLeaveRemaining || 12) - leave.daysCount);
        db.prepare('UPDATE users SET paidLeaveRemaining = ? WHERE id = ?').run(newBal, leave.userId);
      } else if (leave.type === 'Sick') {
        const newBal = Math.max(0, (emp?.sickLeaveRemaining || 8) - leave.daysCount);
        db.prepare('UPDATE users SET sickLeaveRemaining = ? WHERE id = ?').run(newBal, leave.userId);
      }

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

      // Real-Time Notification to Employee for Leave Approval
      db.prepare(`INSERT INTO notifications (userId, title, message, type, leaveId) VALUES (?,?,?,?,?)`)
        .run(
          leave.userId, 
          '✅ Leave Approved', 
          `Your leave request from ${leave.startDate} to ${leave.endDate} has been approved by Admin.`, 
          'success', 
          leave.id
        );

      if (emp && emp.email) {
        sendMail({
          to: emp.email,
          subject: `ElyVia HRMS — Leave Request Approved! 🎉`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee5d8; border-radius: 12px; background: #ffffff;">
              <h3 style="color: #9c6137;">Leave Approved 🎉</h3>
              <p>Hello <strong>${emp.name}</strong>,</p>
              <p>Your <strong>${leave.type} Leave</strong> request from <strong>${leave.startDate}</strong> to <strong>${leave.endDate}</strong> (${leave.daysCount} day(s)) has been approved by HR Admin.</p>
              ${adminComment ? `<p style="background: #fdfaf6; padding: 12px; border-radius: 8px; font-size: 13px;">HR Comment: ${adminComment}</p>` : ''}
            </div>
          `
        }).catch(() => {});
      }
    } else {
      // Real-Time Notification to Employee for Leave Rejection
      db.prepare(`INSERT INTO notifications (userId, title, message, type, leaveId) VALUES (?,?,?,?,?)`)
        .run(
          leave.userId, 
          '❌ Leave Rejected', 
          `Your leave request from ${leave.startDate} to ${leave.endDate} has been rejected.${adminComment ? ' Reason: ' + adminComment : ''}`, 
          'danger', 
          leave.id
        );

      if (emp && emp.email) {
        sendMail({
          to: emp.email,
          subject: `ElyVia HRMS — Leave Request Decision`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee5d8; border-radius: 12px; background: #ffffff;">
              <h3 style="color: #dc2626;">Leave Request Rejected</h3>
              <p>Hello <strong>${emp.name}</strong>,</p>
              <p>Your <strong>${leave.type} Leave</strong> request from <strong>${leave.startDate}</strong> to <strong>${leave.endDate}</strong> was rejected.</p>
              ${adminComment ? `<p style="background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 13px;">HR Reason: ${adminComment}</p>` : ''}
            </div>
          `
        }).catch(() => {});
      }
    }

    const updated = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
    res.json(updated || { id: req.params.id, status });
  } catch (err) {
    console.error('Update leave error:', err);
    res.status(500).json({ error: err.message || 'Failed to update leave decision' });
  }
});

module.exports = router;

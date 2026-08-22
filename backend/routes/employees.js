const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware');

const router = express.Router();

function parseDocs(user) {
  if (!user) return user;
  try {
    user.documents = JSON.parse(user.documents || '[]');
  } catch (e) {
    user.documents = [];
  }
  return user;
}

// Get current user's profile
router.get('/me', auth, (req, res) => {
  const activeUserId = req.user?.id || req.user?.userId;
  let user = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(activeUserId);
  if (!user && req.user?.email) {
    user = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE email = ?').get(req.user.email);
  }
  if (!user) return res.status(404).json({ error: 'User profile not found' });
  res.json(parseDocs(user));
});

// Employee edits permitted profile details (name, phone, address, profilePicture)
router.put('/me', auth, (req, res) => {
  const { name, phone, address, profilePicture } = req.body;
  const activeUserId = req.user?.id || req.user?.userId;

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(activeUserId);
  if (!existing) return res.status(404).json({ error: 'Profile record not found' });

  const finalName = name || existing.name;
  const finalPhone = phone !== undefined ? phone : existing.phone;
  const finalAddress = address !== undefined ? address : existing.address;
  const finalPic = profilePicture !== undefined ? profilePicture : existing.profilePicture;

  db.prepare('UPDATE users SET name = ?, phone = ?, address = ?, profilePicture = ? WHERE id = ?')
    .run(finalName, finalPhone, finalAddress, finalPic, activeUserId);

  // Notify requesting employee
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(activeUserId, 'Profile Updated', 'You successfully updated your profile information.', 'info');

  // Notify ALL Admins in database
  const admins = db.prepare(`SELECT id FROM users WHERE role = 'Admin'`).all() || [];
  admins.forEach(admin => {
    if (String(admin.id) !== String(activeUserId)) {
      db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
        .run(admin.id, '👤 Profile Update Alert', `${finalName} updated their contact profile information.`, 'info');
    }
  });

  const updated = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(activeUserId);
  res.json(parseDocs(updated));
});

// Employee soft-deactivates profile (preserves historical records)
router.post('/me/deactivate', auth, (req, res) => {
  const activeUserId = req.user?.id || req.user?.userId;
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(activeUserId);

  db.prepare('UPDATE users SET isEmailVerified = 0 WHERE id = ?').run(activeUserId);

  // Notify Admins
  const admins = db.prepare(`SELECT id FROM users WHERE role = 'Admin'`).all() || [];
  admins.forEach(admin => {
    db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
      .run(admin.id, '⚠️ Account Deactivated', `${user?.name || 'An Employee'} deactivated their user profile.`, 'warning');
  });

  res.json({ success: true, message: 'Profile deactivated successfully' });
});

// Add document to employee profile
router.post('/me/documents', auth, (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Document name and type required' });

  const activeUserId = req.user?.id || req.user?.userId;
  const user = db.prepare('SELECT name, documents FROM users WHERE id = ?').get(activeUserId);
  let docs = [];
  try { docs = JSON.parse(user.documents || '[]'); } catch (e) {}

  const newDoc = {
    id: 'doc-' + Date.now(),
    name,
    type,
    date: new Date().toISOString().slice(0, 10),
    size: (Math.random() * 2 + 0.5).toFixed(1) + ' MB'
  };

  docs.unshift(newDoc);
  db.prepare('UPDATE users SET documents = ? WHERE id = ?').run(JSON.stringify(docs), activeUserId);

  // Notify ALL Admins in database
  const admins = db.prepare(`SELECT id FROM users WHERE role = 'Admin'`).all() || [];
  admins.forEach(admin => {
    db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
      .run(admin.id, '📄 New Document Uploaded', `${user?.name || 'An Employee'} uploaded document "${name}" (${type}).`, 'info');
  });

  res.status(201).json(docs);
});

// Delete document from profile
router.delete('/me/documents/:docId', auth, (req, res) => {
  const activeUserId = req.user?.id || req.user?.userId;
  const user = db.prepare('SELECT documents FROM users WHERE id = ?').get(activeUserId);
  let docs = [];
  try { docs = JSON.parse(user.documents || '[]'); } catch (e) {}

  docs = docs.filter(d => d.id !== req.params.docId);
  db.prepare('UPDATE users SET documents = ? WHERE id = ?').run(JSON.stringify(docs), activeUserId);

  res.json(docs);
});

// Admin: Get all employees (requireAdmin)
router.get('/', auth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users ORDER BY name').all();
  res.json((users || []).map(parseDocs));
});

// Admin: Get specific employee by ID (requireAdmin)
router.get('/:id', auth, requireAdmin, (req, res) => {
  const user = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Employee not found' });
  res.json(parseDocs(user));
});

// Admin: Edit any employee's full records (requireAdmin)
router.put('/:id', auth, requireAdmin, (req, res) => {
  const { name, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, role } = req.body;
  const targetId = req.params.id;

  db.prepare(`
    UPDATE users SET name = ?, phone = ?, address = ?, department = ?, designation = ?, joinDate = ?, salary = ?, basicSalary = ?, hra = ?, allowances = ?, pf = ?, tax = ?, role = ?
    WHERE id = ?
  `).run(name, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, role, targetId);

  // Notify Employee of Admin Update
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(targetId, 'Profile Updated by HR Admin', 'Your employee profile record has been updated by HR Admin.', 'info');

  const updated = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(targetId);
  res.json(parseDocs(updated));
});

module.exports = router;

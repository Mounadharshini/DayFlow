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
  const user = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(parseDocs(user));
});

// Employee edits limited fields on self
router.put('/me', auth, (req, res) => {
  const { phone, address, profilePicture } = req.body;
  db.prepare('UPDATE users SET phone = ?, address = ?, profilePicture = ? WHERE id = ?')
    .run(phone || '', address || '', profilePicture || '', req.user.id);

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.user.id, 'Profile Updated', 'You successfully updated your profile information.', 'info');

  const user = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(req.user.id);
  res.json(parseDocs(user));
});

// Add document to employee profile
router.post('/me/documents', auth, (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Document name and type required' });

  const user = db.prepare('SELECT documents FROM users WHERE id = ?').get(req.user.id);
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
  db.prepare('UPDATE users SET documents = ? WHERE id = ?').run(JSON.stringify(docs), req.user.id);

  res.status(201).json(docs);
});

// Delete document from profile
router.delete('/me/documents/:docId', auth, (req, res) => {
  const user = db.prepare('SELECT documents FROM users WHERE id = ?').get(req.user.id);
  let docs = [];
  try { docs = JSON.parse(user.documents || '[]'); } catch (e) {}

  docs = docs.filter(d => d.id !== req.params.docId);
  db.prepare('UPDATE users SET documents = ? WHERE id = ?').run(JSON.stringify(docs), req.user.id);

  res.json(docs);
});

// Admin: list all employees
router.get('/', auth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, paidLeaveRemaining, sickLeaveRemaining FROM users ORDER BY name').all();
  res.json(users);
});

// Admin: get one employee full details
router.get('/:id', auth, requireAdmin, (req, res) => {
  const user = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Employee not found' });
  res.json(parseDocs(user));
});

// Admin: edit any employee fully
router.put('/:id', auth, requireAdmin, (req, res) => {
  const { name, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, role } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Employee not found' });

  const totalSalary = Number(salary) || (Number(basicSalary || 0) + Number(hra || 0) + Number(allowances || 0));
  const calcBasic = basicSalary !== undefined ? Number(basicSalary) : totalSalary * 0.5;
  const calcHra = hra !== undefined ? Number(hra) : totalSalary * 0.25;
  const calcAllow = allowances !== undefined ? Number(allowances) : totalSalary * 0.25;
  const calcPf = pf !== undefined ? Number(pf) : Math.round(calcBasic * 0.12);
  const calcTax = tax !== undefined ? Number(tax) : Math.round(totalSalary * 0.10);

  db.prepare(`UPDATE users SET 
    name = ?, phone = ?, address = ?, department = ?, designation = ?, joinDate = ?, 
    salary = ?, basicSalary = ?, hra = ?, allowances = ?, pf = ?, tax = ?, role = ? 
    WHERE id = ?`)
    .run(
      name, phone || '', address || '', department || '', designation || '', joinDate || '',
      totalSalary, calcBasic, calcHra, calcAllow, calcPf, calcTax, role || 'Employee', req.params.id
    );

  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(req.params.id, 'Profile Updated by HR', 'Your profile and salary structure details have been updated by HR Admin.', 'info');

  const updated = db.prepare('SELECT id, employeeId, name, email, role, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, profilePicture, isEmailVerified, documents, paidLeaveRemaining, sickLeaveRemaining FROM users WHERE id = ?').get(req.params.id);
  res.json(parseDocs(updated));
});

module.exports = router;

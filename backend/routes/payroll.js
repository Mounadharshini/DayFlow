const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware');

const router = express.Router();

function calculatePayrollComponents(user) {
  const annualSalary = Number(user.salary) || 600000;
  const monthlyGross = Math.round(annualSalary / 12);
  const basic = user.basicSalary ? Math.round(Number(user.basicSalary) / 12) : Math.round(monthlyGross * 0.5);
  const hra = user.hra ? Math.round(Number(user.hra) / 12) : Math.round(monthlyGross * 0.25);
  const allowances = user.allowances ? Math.round(Number(user.allowances) / 12) : Math.round(monthlyGross * 0.25);
  const pf = user.pf ? Math.round(Number(user.pf) / 12) : Math.round(basic * 0.12);
  const tax = user.tax ? Math.round(Number(user.tax) / 12) : Math.round(monthlyGross * 0.10);

  const grossSalary = basic + hra + allowances;
  const totalDeductions = pf + tax;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    userId: user.id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    department: user.department || 'General',
    designation: user.designation || 'Staff',
    joinDate: user.joinDate || new Date().toISOString().slice(0, 10),
    annualSalary,
    monthlyGross,
    basicSalary: basic,
    hra,
    allowances,
    pf,
    tax,
    grossSalary,
    totalDeductions,
    netSalary,
    bankName: 'ElyVia Corporate Bank',
    accountNumber: '**** **** 4892'
  };
}

// Employee: View own read-only payroll structure & history
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Employee not found' });

  const currentStructure = calculatePayrollComponents(user);
  const history = db.prepare('SELECT * FROM payroll WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);

  res.json({
    structure: currentStructure,
    history
  });
});

// Admin: View all employees' payroll structures & overall organization metrics
router.get('/', auth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users WHERE role = "Employee" OR role = "Admin" ORDER BY name').all();
  const payrollStructures = users.map(calculatePayrollComponents);
  const allRecords = db.prepare('SELECT * FROM payroll ORDER BY createdAt DESC').all();

  const totalAnnualBudget = users.reduce((sum, u) => sum + (Number(u.salary) || 0), 0);
  const totalMonthlyGross = Math.round(totalAnnualBudget / 12);
  const totalNetDisbursement = payrollStructures.reduce((sum, p) => sum + p.netSalary, 0);
  const totalDeductions = payrollStructures.reduce((sum, p) => sum + p.totalDeductions, 0);

  res.json({
    summary: {
      totalEmployees: users.length,
      totalAnnualBudget,
      totalMonthlyGross,
      totalNetDisbursement,
      totalDeductions
    },
    payrollStructures,
    historyRecords: allRecords
  });
});

// Admin: Update Employee Salary Structure (Real-Time Notification Triggered)
router.put('/salary-structure/:userId', auth, requireAdmin, (req, res) => {
  const { salary, basicSalary, hra, allowances, pf, tax } = req.body;
  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);

  if (!targetUser) {
    return res.status(404).json({ error: 'Target employee record not found' });
  }

  const newAnnualSalary = Number(salary) || targetUser.salary;
  const newBasic = Number(basicSalary) || targetUser.basicSalary;
  const newHra = Number(hra) || targetUser.hra;
  const newAllowances = Number(allowances) || targetUser.allowances;
  const newPf = Number(pf) || targetUser.pf;
  const newTax = Number(tax) || targetUser.tax;

  // Database Update
  db.prepare('UPDATE users SET salary = ? WHERE id = ?')
    .run(newAnnualSalary, newBasic, newHra, newAllowances, newPf, newTax, req.params.userId);

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  const updatedStructure = calculatePayrollComponents(updatedUser);

  // Trigger Real-Time Notification for Employee
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(
      req.params.userId,
      '💰 Payroll Updated',
      `Your salary information for ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} has been updated. Monthly Net Pay: ₹ ${updatedStructure.netSalary.toLocaleString('en-IN')}.`,
      'success'
    );

  res.json({
    message: 'Salary structure updated successfully',
    structure: updatedStructure
  });
});

// Admin: Generate / Issue New Paystub Slip Record for Employee
router.post('/issue-paystub', auth, requireAdmin, (req, res) => {
  const { userId, payPeriod, paymentStatus, paymentDate } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!user) {
    return res.status(404).json({ error: 'Employee record not found' });
  }

  const calc = calculatePayrollComponents(user);

  const info = db.prepare(`
    INSERT INTO payroll (userId, payPeriod, basicSalary, hra, allowances, pf, tax, grossSalary, netSalary, paymentStatus, paymentDate)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    userId,
    payPeriod || 'August 2026',
    calc.basicSalary,
    calc.hra,
    calc.allowances,
    calc.pf,
    calc.tax,
    calc.grossSalary,
    calc.netSalary,
    paymentStatus || 'Paid',
    paymentDate || new Date().toISOString().slice(0, 10)
  );

  // Trigger Real-Time Notification for Employee
  db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
    .run(
      userId,
      '💰 Salary Slip Released',
      `Your salary slip for ${payPeriod || 'August 2026'} has been generated and issued. Net Pay: ₹ ${calc.netSalary.toLocaleString('en-IN')}.`,
      'success'
    );

  const newRecord = db.prepare('SELECT * FROM payroll WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(newRecord);
});

// Admin: Update Payment Status or Payment Date of a Payroll Record
router.put('/record/:id', auth, requireAdmin, (req, res) => {
  const { paymentStatus, paymentDate } = req.body;
  const record = db.prepare('SELECT * FROM payroll WHERE id = ?').get(req.params.id);

  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }

  db.prepare('UPDATE payroll SET paymentStatus = ?, paymentDate = ? WHERE id = ?')
    .run(paymentStatus || record.paymentStatus, paymentDate || record.paymentDate, req.params.id);

  const updated = db.prepare('SELECT * FROM payroll WHERE id = ?').get(req.params.id);
  res.json(updated);
});

module.exports = router;

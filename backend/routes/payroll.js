const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware');

const router = express.Router();

function buildPaystub(user) {
  const annualSalary = Number(user.salary) || 0;
  const monthlyGross = Math.round(annualSalary / 12);
  const basic = user.basicSalary ? Math.round(user.basicSalary / 12) : Math.round(monthlyGross * 0.5);
  const hra = user.hra ? Math.round(user.hra / 12) : Math.round(monthlyGross * 0.25);
  const allowances = user.allowances ? Math.round(user.allowances / 12) : Math.round(monthlyGross * 0.25);
  const pf = user.pf ? Math.round(user.pf / 12) : Math.round(basic * 0.12);
  const tax = user.tax ? Math.round(user.tax / 12) : Math.round(monthlyGross * 0.10);
  const totalDeductions = pf + tax;
  const netPay = Math.max(0, monthlyGross - totalDeductions);

  return {
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    department: user.department,
    designation: user.designation,
    joinDate: user.joinDate,
    annualSalary,
    monthlyGross,
    earnings: {
      basic,
      hra,
      allowances,
      totalEarnings: monthlyGross
    },
    deductions: {
      pf,
      tax,
      totalDeductions
    },
    netPay,
    payPeriod: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    paymentStatus: 'Processed',
    bankName: 'First National Tech Bank',
    accountNumber: '**** **** 4892'
  };
}

// Employee: View paystub details
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(buildPaystub(user));
});

// Admin: View overall payroll matrix
router.get('/', auth, requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, employeeId, name, email, role, department, designation, salary, basicSalary, hra, allowances, pf, tax FROM users ORDER BY name').all();
  const payrollList = users.map(buildPaystub);

  const totalAnnualBudget = users.reduce((sum, u) => sum + (Number(u.salary) || 0), 0);
  const totalMonthlyGross = Math.round(totalAnnualBudget / 12);
  const totalNetDisbursement = payrollList.reduce((sum, p) => sum + p.netPay, 0);
  const totalDeductions = payrollList.reduce((sum, p) => sum + p.deductions.totalDeductions, 0);

  res.json({
    summary: {
      totalEmployees: users.length,
      totalAnnualBudget,
      totalMonthlyGross,
      totalNetDisbursement,
      totalDeductions
    },
    payrolls: payrollList
  });
});

module.exports = router;

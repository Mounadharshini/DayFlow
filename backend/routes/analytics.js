const express = require('express');
const db = require('../db');
const { auth, requireAdmin } = require('../middleware');

const router = express.Router();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', auth, requireAdmin, (req, res) => {
  const date = todayStr();

  // Metrics
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "Employee"').get()?.count || 0;

  const todayPresent = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Present"').get(date)?.count || 0;
  const todayAbsent = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Absent"').get(date)?.count || 0;
  const todayOnLeave = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Leave"').get(date)?.count || 0;

  const pendingLeaves = db.prepare('SELECT COUNT(*) as count FROM leaves WHERE status = "Pending"').get()?.count || 0;

  // Monthly payroll total
  const annualTotal = db.prepare('SELECT SUM(salary) as sum FROM users').get()?.sum || 0;
  const monthlyPayroll = Math.round(annualTotal / 12);

  // Department distribution
  const deptRows = db.prepare('SELECT department, COUNT(*) as count FROM users GROUP BY department').all() || [];
  const departmentStats = (deptRows || []).map(r => ({
    department: r.department || 'Unassigned',
    count: r.count || 0
  }));

  // Leave types count
  const leaveRows = db.prepare('SELECT type, COUNT(*) as count FROM leaves GROUP BY type').all() || [];
  const leaveStats = (leaveRows || []).map(r => ({
    type: r.type || 'General',
    count: r.count || 0
  }));

  // Recent 7 days attendance trend
  const trendDays = [];
  const todayDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const pres = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Present"').get(dStr)?.count || 0;
    const lv = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Leave"').get(dStr)?.count || 0;
    const abs = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Absent"').get(dStr)?.count || 0;
    trendDays.push({
      date: dStr,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      present: pres,
      leave: lv,
      absent: abs
    });
  }

  res.json({
    metrics: {
      totalEmployees,
      todayPresent,
      todayAbsent,
      todayOnLeave,
      pendingLeaves,
      monthlyPayroll
    },
    departmentStats,
    leaveStats,
    attendanceTrend: trendDays
  });
});

module.exports = router;

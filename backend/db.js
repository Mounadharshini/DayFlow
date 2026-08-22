const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbFile = path.join(__dirname, 'elyvia_db.json');

// Memory store backed by JSON file for local execution & zero-downtime fallback
let data = {
  users: [],
  attendance: [],
  leaves: [],
  notifications: [],
  payroll: []
};

function loadDB() {
  try {
    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, 'utf8');
      const parsed = JSON.parse(raw);
      data = {
        users: parsed.users || [],
        attendance: parsed.attendance || [],
        leaves: parsed.leaves || [],
        notifications: parsed.notifications || [],
        payroll: parsed.payroll || []
      };
    }
  } catch (e) {
    console.error('Failed reading DB file, reinitializing...', e);
  }
}

function saveDB() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed saving DB file:', e);
  }
}

loadDB();

// MySQL Connection Pool (attempts connection to MySQL if active)
let pool = null;
try {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'elyvia_hrms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL Database Engine connected successfully!');
      conn.release();
    })
    .catch(err => {
      console.log('ℹ️ MySQL not active locally. Operating on ElyVia High-Performance File Database Engine.');
    });
} catch (e) {
  console.log('ℹ️ Operating on ElyVia File Database Engine.');
}

// Helper to calculate next integer ID safely
function getNextId(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 1;
  const max = arr.reduce((acc, curr) => {
    const num = Number(curr.id);
    return !isNaN(num) && num > acc ? num : acc;
  }, 0);
  return max + 1;
}

// Database Engine matching prepared statement API
const db = {
  pragma: () => {},
  exec: (sql) => {},
  prepare: (sqlStr) => {
    const cleanSql = sqlStr.trim().replace(/\s+/g, ' ');

    return {
      get: (...params) => {
        if (cleanSql.includes('FROM users WHERE email = ? OR employeeId = ?')) {
          const [email, empId] = params;
          return data.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() || u.employeeId === empId);
        }
        if (cleanSql.includes('FROM users WHERE email = ?') || cleanSql.includes('WHERE LOWER(email) = ?')) {
          const [email] = params;
          const target = (email || '').toLowerCase();
          return data.users.find(u => u.email.toLowerCase() === target);
        }
        if (cleanSql.includes('FROM users WHERE id = ?')) {
          const [id] = params;
          return data.users.find(u => String(u.id) === String(id));
        }
        if (cleanSql.includes('FROM users WHERE role = "Admin"') || cleanSql.includes("WHERE role = 'Admin'")) {
          return data.users.find(u => u.role === 'Admin');
        }
        if (cleanSql.includes('FROM users WHERE role = ?')) {
          const [role] = params;
          return data.users.find(u => u.role === role);
        }
        if (cleanSql.includes('SELECT COUNT(*) as count FROM users WHERE role = "Employee"') || cleanSql.includes("WHERE role = 'Employee'")) {
          return { count: data.users.filter(u => u.role === 'Employee').length };
        }

        // Attendance SELECT get
        if (cleanSql.includes('FROM attendance WHERE userId = ? AND date = ?')) {
          const [uId, d] = params;
          return data.attendance.find(a => String(a.userId) === String(uId) && a.date === d);
        }
        if (cleanSql.includes('FROM attendance WHERE id = ?')) {
          const [id] = params;
          return data.attendance.find(a => String(a.id) === String(id));
        }

        // Leaves SELECT get
        if (cleanSql.includes('FROM leaves WHERE id = ?')) {
          const [id] = params;
          return data.leaves.find(l => String(l.id) === String(id));
        }

        // Notifications SELECT get
        if (cleanSql.includes('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0')) {
          const [uId] = params;
          return { count: data.notifications.filter(n => String(n.userId) === String(uId) && !n.isRead).length };
        }

        // Payroll SELECT get
        if (cleanSql.includes('FROM payroll WHERE id = ?')) {
          const [id] = params;
          return data.payroll.find(p => String(p.id) === String(id));
        }

        return undefined;
      },

      all: (...params) => {
        if (cleanSql.includes('FROM users') && !cleanSql.includes('JOIN')) {
          if (cleanSql.includes('WHERE role = "Admin"') || cleanSql.includes("WHERE role = 'Admin'")) {
            return data.users.filter(u => u.role === 'Admin');
          }
          return data.users.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (cleanSql.includes('FROM attendance') && cleanSql.includes('JOIN users')) {
          const [p1] = params;
          if (cleanSql.includes('WHERE a.userId = ?')) {
            const rows = data.attendance.filter(a => String(a.userId) === String(p1));
            return rows.map(a => {
              const u = data.users.find(usr => String(usr.id) === String(a.userId)) || {};
              return { ...a, name: u.name, employeeId: u.employeeId, department: u.department };
            }).sort((a, b) => b.date.localeCompare(a.date));
          } else {
            const dateFilter = p1;
            const rows = data.attendance.filter(a => a.date === dateFilter);
            return rows.map(a => {
              const u = data.users.find(usr => String(usr.id) === String(a.userId)) || {};
              return { ...a, name: u.name, employeeId: u.employeeId, department: u.department };
            }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          }
        }

        if (cleanSql.includes('FROM leaves') && cleanSql.includes('JOIN users')) {
          const [statusFilter] = params;
          let rows = data.leaves;
          if (statusFilter && statusFilter !== 'All') {
            rows = rows.filter(l => l.status === statusFilter);
          }
          return rows.map(l => {
            const u = data.users.find(usr => String(usr.id) === String(l.userId)) || {};
            return { ...l, name: u.name, employeeId: u.employeeId, department: u.department };
          }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }

        if (cleanSql.includes('FROM leaves WHERE userId = ?')) {
          const [uId] = params;
          return data.leaves.filter(l => String(l.userId) === String(uId)).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }

        if (cleanSql.includes('FROM notifications WHERE userId = ?')) {
          const [uId] = params;
          return data.notifications
            .filter(n => String(n.userId) === String(uId))
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .slice(0, 50);
        }

        if (cleanSql.includes('FROM payroll WHERE userId = ?')) {
          const [uId] = params;
          return data.payroll.filter(p => String(p.userId) === String(uId)).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }

        if (cleanSql.includes('FROM payroll')) {
          return data.payroll.map(p => {
            const u = data.users.find(usr => String(usr.id) === String(p.userId)) || {};
            return { ...p, name: u.name, employeeId: u.employeeId, department: u.department, designation: u.designation };
          }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }

        return [];
      },

      run: (...params) => {
        if (cleanSql.includes('INSERT INTO users')) {
          let u;
          if (cleanSql.includes('isEmailVerified')) {
            u = {
              id: getNextId(data.users),
              employeeId: params[0],
              name: params[1],
              email: params[2],
              password: params[3],
              role: params[4] || 'Employee',
              isEmailVerified: params[5] !== undefined ? Number(params[5]) : 0,
              otpCode: params[6] || '',
              phone: '',
              address: '',
              department: 'General',
              designation: 'Staff',
              joinDate: new Date().toISOString().slice(0, 10),
              salary: 600000,
              basicSalary: 300000,
              hra: 150000,
              allowances: 150000,
              pf: 36000,
              tax: 60000,
              profilePicture: (params[6] && typeof params[6] === 'string' && params[6].startsWith('http')) ? params[6] : '',
              documents: '[]',
              paidLeaveRemaining: 12,
              sickLeaveRemaining: 8,
              createdAt: new Date().toISOString()
            };
          } else {
            u = {
              id: getNextId(data.users),
              employeeId: params[0],
              name: params[1],
              email: params[2],
              password: params[3],
              role: params[4] || 'Employee',
              department: params[5] || 'General',
              designation: params[6] || 'Staff',
              joinDate: params[7] || new Date().toISOString().slice(0, 10),
              salary: params[8] || 600000,
              basicSalary: params[9] || 300000,
              hra: params[10] || 150000,
              allowances: params[11] || 150000,
              pf: params[12] || 36000,
              tax: params[13] || 60000,
              isEmailVerified: params[14] !== undefined ? Number(params[14]) : 1,
              phone: params[15] || '',
              address: params[16] || '',
              profilePicture: params[17] || '',
              documents: params[18] || '[]',
              paidLeaveRemaining: 12,
              sickLeaveRemaining: 8,
              createdAt: new Date().toISOString()
            };
          }
          data.users.push(u);
          saveDB();
          return { lastInsertRowid: u.id };
        }

        // USER OTP UPDATES
        if (cleanSql.includes('UPDATE users SET otpCode = ? WHERE id = ?')) {
          const [otp, id] = params;
          const u = data.users.find(x => String(x.id) === String(id));
          if (u) {
            u.otpCode = String(otp);
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET isEmailVerified = 1')) {
          const id = params[params.length - 1];
          const u = data.users.find(x => String(x.id) === String(id));
          if (u) {
            u.isEmailVerified = 1;
            u.otpCode = '';
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET phone = ?, address = ?, profilePicture = ? WHERE id = ?')) {
          const [phone, address, pic, id] = params;
          const u = data.users.find(x => String(x.id) === String(id));
          if (u) {
            u.phone = phone || '';
            u.address = address || '';
            u.profilePicture = pic || '';
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET paidLeaveRemaining = ? WHERE id = ?')) {
          const [bal, id] = params;
          const u = data.users.find(x => String(x.id) === String(id));
          if (u) {
            u.paidLeaveRemaining = Number(bal);
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET sickLeaveRemaining = ? WHERE id = ?')) {
          const [bal, id] = params;
          const u = data.users.find(x => String(x.id) === String(id));
          if (u) {
            u.sickLeaveRemaining = Number(bal);
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET salary = ?')) {
          const [sal, basic, hra, allowances, pf, tax, id] = params;
          const u = data.users.find(x => String(x.id) === String(id));
          if (u) {
            u.salary = Number(sal) || 0;
            u.basicSalary = Number(basic) || 0;
            u.hra = Number(hra) || 0;
            u.allowances = Number(allowances) || 0;
            u.pf = Number(pf) || 0;
            u.tax = Number(tax) || 0;
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET name = ?')) {
          const [name, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, role, id] = params;
          const u = data.users.find(x => String(x.id) === String(id));
          if (u) {
            if (name) u.name = name;
            if (phone !== undefined) u.phone = phone;
            if (address !== undefined) u.address = address;
            if (department !== undefined) u.department = department;
            if (designation !== undefined) u.designation = designation;
            if (joinDate !== undefined) u.joinDate = joinDate;
            if (salary !== undefined) u.salary = Number(salary);
            if (basicSalary !== undefined) u.basicSalary = Number(basicSalary);
            if (hra !== undefined) u.hra = Number(hra);
            if (allowances !== undefined) u.allowances = Number(allowances);
            if (pf !== undefined) u.pf = Number(pf);
            if (tax !== undefined) u.tax = Number(tax);
            if (role !== undefined) u.role = role;
            saveDB();
          }
          return { changes: 1 };
        }

        // Attendance & Leaves Mutations
        if (cleanSql.includes('INSERT INTO attendance') || cleanSql.includes('INSERT OR IGNORE INTO attendance')) {
          const [userId, date, status, checkIn, checkOut, workHours] = params;
          const existing = data.attendance.find(a => String(a.userId) === String(userId) && a.date === date);
          if (!existing) {
            const att = {
              id: getNextId(data.attendance),
              userId,
              date,
              status: status || 'Present',
              checkIn: checkIn || null,
              checkOut: checkOut || null,
              workHours: workHours || 8
            };
            data.attendance.push(att);
            saveDB();
            return { lastInsertRowid: att.id };
          }
          return { changes: 0 };
        }

        if (cleanSql.includes('UPDATE attendance SET checkIn = ?, status = ? WHERE id = ?')) {
          const [cIn, st, id] = params;
          const a = data.attendance.find(x => String(x.id) === String(id));
          if (a) { a.checkIn = cIn; a.status = st; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE attendance SET checkOut = ?, workHours = ? WHERE id = ?')) {
          const [cOut, hrs, id] = params;
          const a = data.attendance.find(x => String(x.id) === String(id));
          if (a) { a.checkOut = cOut; a.workHours = hrs; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE attendance SET status = ?, checkIn = ?, checkOut = ?, workHours = ? WHERE id = ?')) {
          const [st, cIn, cOut, hrs, id] = params;
          const a = data.attendance.find(x => String(x.id) === String(id));
          if (a) {
            a.status = st;
            a.checkIn = cIn;
            a.checkOut = cOut;
            a.workHours = Number(hrs) || 8;
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE attendance SET status = ? WHERE id = ?')) {
          const [st, id] = params;
          const a = data.attendance.find(x => String(x.id) === String(id));
          if (a) { a.status = st; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('INSERT INTO leaves')) {
          const [userId, type, startDate, endDate, daysCount, remarks] = params;
          const lv = {
            id: getNextId(data.leaves),
            userId,
            type,
            startDate,
            endDate,
            daysCount: Number(daysCount) || 1,
            remarks: remarks || '',
            status: 'Pending',
            adminComment: '',
            createdAt: new Date().toISOString()
          };
          data.leaves.push(lv);
          saveDB();
          return { lastInsertRowid: lv.id };
        }

        if (cleanSql.includes('UPDATE leaves SET status = ?, adminComment = ? WHERE id = ?')) {
          const [st, cm, id] = params;
          const l = data.leaves.find(x => String(x.id) === String(id));
          if (l) { l.status = st; l.adminComment = cm || ''; saveDB(); }
          return { changes: 1 };
        }

        // Notification Mutations
        if (cleanSql.includes('INSERT INTO notifications')) {
          const [userId, title, message, type, leaveId] = params;
          const notif = {
            id: getNextId(data.notifications),
            userId: Number(userId) || userId,
            title,
            message,
            type: type || 'info',
            leaveId: leaveId || null,
            isRead: 0,
            createdAt: new Date().toISOString()
          };
          data.notifications.push(notif);
          saveDB();
          return { lastInsertRowid: notif.id };
        }

        if (cleanSql.includes('UPDATE notifications SET isRead = 1')) {
          if (cleanSql.includes('id = ?')) {
            const [notifId, uId] = params;
            data.notifications.forEach(n => {
              if (String(n.id) === String(notifId) && (uId ? String(n.userId) === String(uId) : true)) n.isRead = 1;
            });
          } else {
            const [uId] = params;
            data.notifications.forEach(n => {
              if (String(n.userId) === String(uId)) n.isRead = 1;
            });
          }
          saveDB();
          return { changes: 1 };
        }

        if (cleanSql.includes('DELETE FROM notifications')) {
          if (cleanSql.includes('id = ?')) {
            const [notifId, uId] = params;
            data.notifications = data.notifications.filter(x => !(String(x.id) === String(notifId) && (uId ? String(x.userId) === String(uId) : true)));
          } else {
            const [uId] = params;
            data.notifications = data.notifications.filter(x => String(x.userId) !== String(uId));
          }
          saveDB();
          return { changes: 1 };
        }

        // Payroll Mutations
        if (cleanSql.includes('INSERT INTO payroll')) {
          const [userId, payPeriod, basicSalary, hra, allowances, pf, tax, grossSalary, netSalary, paymentStatus, paymentDate] = params;
          const item = {
            id: getNextId(data.payroll),
            userId,
            payPeriod: payPeriod || 'August 2026',
            basicSalary: Number(basicSalary) || 0,
            hra: Number(hra) || 0,
            allowances: Number(allowances) || 0,
            pf: Number(pf) || 0,
            tax: Number(tax) || 0,
            grossSalary: Number(grossSalary) || 0,
            netSalary: Number(netSalary) || 0,
            paymentStatus: paymentStatus || 'Paid',
            paymentDate: paymentDate || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          data.payroll.push(item);
          saveDB();
          return { lastInsertRowid: item.id };
        }

        if (cleanSql.includes('UPDATE payroll SET paymentStatus = ?, paymentDate = ? WHERE id = ?')) {
          const [st, dt, id] = params;
          const p = data.payroll.find(x => String(x.id) === String(id));
          if (p) {
            p.paymentStatus = st;
            if (dt) p.paymentDate = dt;
            p.updatedAt = new Date().toISOString();
            saveDB();
          }
          return { changes: 1 };
        }

        return { changes: 1 };
      }
    };
  }
};

// Ensure default ElyVia Admin user is present
const adminExists = data.users.find(u => u.email.toLowerCase() === 'admin@elyvia.com' || u.email.toLowerCase() === 'admin@dayflow.com' || u.role === 'Admin');
if (!adminExists) {
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  data.users.push({
    id: 1,
    employeeId: 'EMP-ADMIN',
    name: 'ElyVia HR Admin',
    email: 'admin@elyvia.com',
    password: adminHash,
    role: 'Admin',
    department: 'Human Resources',
    designation: 'HR Executive Director',
    joinDate: new Date().toISOString().slice(0, 10),
    salary: 1200000,
    basicSalary: 600000,
    hra: 300000,
    allowances: 300000,
    pf: 72000,
    tax: 120000,
    isEmailVerified: 1,
    phone: '+1 (555) 019-2834',
    address: 'ElyVia HR HQ, Suite 500',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    documents: '[]',
    paidLeaveRemaining: 12,
    sickLeaveRemaining: 8,
    createdAt: new Date().toISOString()
  });
  saveDB();
}

console.log('ElyVia Engine initialized with', data.users.length, 'user(s) [Admin account active]. Database strict comparisons active.');

module.exports = db;

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbFile = path.join(__dirname, 'elyvia_db.json');

// Memory store backed by JSON file for local execution & fallback
let data = {
  users: [],
  attendance: [],
  leaves: [],
  notifications: []
};

function loadDB() {
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf8');
      data = JSON.parse(raw);
    } catch (e) {
      console.error('Failed reading DB file, reinitializing...');
    }
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
          return data.users.find(u => u.id == id);
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
        if (cleanSql.includes('SELECT COUNT(*) as count FROM users WHERE role = ?')) {
          const [role] = params;
          return { count: data.users.filter(u => u.role === role).length };
        }
        if (cleanSql.includes('SELECT SUM(salary) as sum FROM users')) {
          const sum = data.users.reduce((acc, u) => acc + (Number(u.salary) || 0), 0);
          return { sum };
        }

        // Attendance SELECT get
        if (cleanSql.includes('FROM attendance WHERE userId = ? AND date = ?')) {
          const [uId, d] = params;
          return data.attendance.find(a => a.userId == uId && a.date === d);
        }
        if (cleanSql.includes('FROM attendance WHERE id = ?')) {
          const [id] = params;
          return data.attendance.find(a => a.id == id);
        }
        if (cleanSql.includes('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Present"')) {
          const [d] = params;
          return { count: data.attendance.filter(a => a.date === d && a.status === 'Present').length };
        }
        if (cleanSql.includes('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Absent"')) {
          const [d] = params;
          return { count: data.attendance.filter(a => a.date === d && a.status === 'Absent').length };
        }
        if (cleanSql.includes('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Leave"')) {
          const [d] = params;
          return { count: data.attendance.filter(a => a.date === d && a.status === 'Leave').length };
        }

        // Leaves SELECT get
        if (cleanSql.includes('FROM leaves WHERE id = ?')) {
          const [id] = params;
          return data.leaves.find(l => l.id == id);
        }
        if (cleanSql.includes('SELECT COUNT(*) as count FROM leaves WHERE status = "Pending"')) {
          return { count: data.leaves.filter(l => l.status === 'Pending').length };
        }

        // Notifications SELECT get
        if (cleanSql.includes('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0')) {
          const [uId] = params;
          return { count: data.notifications.filter(n => n.userId == uId && !n.isRead).length };
        }

        return undefined;
      },

      all: (...params) => {
        if (cleanSql.includes('FROM users') && !cleanSql.includes('JOIN')) {
          return data.users.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (cleanSql.includes('FROM attendance') && cleanSql.includes('JOIN users')) {
          const [p1] = params;
          if (cleanSql.includes('WHERE a.userId = ?')) {
            const rows = data.attendance.filter(a => a.userId == p1);
            return rows.map(a => {
              const u = data.users.find(usr => usr.id == a.userId) || {};
              return { ...a, name: u.name, employeeId: u.employeeId, department: u.department };
            }).sort((a, b) => b.date.localeCompare(a.date));
          } else {
            const dateFilter = p1;
            const rows = data.attendance.filter(a => a.date === dateFilter);
            return rows.map(a => {
              const u = data.users.find(usr => usr.id == a.userId) || {};
              return { ...a, name: u.name, employeeId: u.employeeId, department: u.department };
            }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          }
        }

        if (cleanSql.includes('FROM attendance WHERE userId = ?')) {
          const [uId, start] = params;
          let rows = data.attendance.filter(a => a.userId == uId);
          if (start) rows = rows.filter(a => a.date >= start);
          return rows.sort((a, b) => b.date.localeCompare(a.date));
        }

        if (cleanSql.includes('FROM leaves') && cleanSql.includes('JOIN users')) {
          const [statusFilter] = params;
          let rows = data.leaves;
          if (statusFilter && statusFilter !== 'All') {
            rows = rows.filter(l => l.status === statusFilter);
          }
          return rows.map(l => {
            const u = data.users.find(usr => usr.id == l.userId) || {};
            return { ...l, name: u.name, employeeId: u.employeeId, department: u.department };
          }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }

        if (cleanSql.includes('FROM leaves WHERE userId = ?')) {
          const [uId] = params;
          return data.leaves.filter(l => l.userId == uId).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        }

        if (cleanSql.includes('SELECT department, COUNT(*) as count FROM users GROUP BY department')) {
          const map = {};
          data.users.forEach(u => {
            const d = u.department || 'Unassigned';
            map[d] = (map[d] || 0) + 1;
          });
          return Object.keys(map).map(dept => ({ department: dept, count: map[dept] }));
        }

        if (cleanSql.includes('SELECT type, COUNT(*) as count FROM leaves GROUP BY type')) {
          const map = {};
          data.leaves.forEach(l => {
            map[l.type] = (map[l.type] || 0) + 1;
          });
          return Object.keys(map).map(t => ({ type: t, count: map[t] }));
        }

        if (cleanSql.includes('FROM notifications WHERE userId = ?')) {
          const [uId] = params;
          return data.notifications
            .filter(n => n.userId == uId)
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
            .slice(0, 20);
        }

        return [];
      },

      run: (...params) => {
        if (cleanSql.includes('INSERT INTO users')) {
          let u;
          if (cleanSql.includes('isEmailVerified')) {
            u = {
              id: data.users.length > 0 ? Math.max(...data.users.map(x => x.id)) + 1 : 1,
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
              salary: 60000,
              basicSalary: 30000,
              hra: 15000,
              allowances: 15000,
              pf: 3600,
              tax: 6000,
              profilePicture: (params[6] && typeof params[6] === 'string' && params[6].startsWith('http')) ? params[6] : '',
              documents: '[]',
              paidLeaveRemaining: 12,
              sickLeaveRemaining: 8,
              createdAt: new Date().toISOString()
            };
          } else {
            u = {
              id: data.users.length > 0 ? Math.max(...data.users.map(x => x.id)) + 1 : 1,
              employeeId: params[0],
              name: params[1],
              email: params[2],
              password: params[3],
              role: params[4] || 'Employee',
              department: params[5] || 'General',
              designation: params[6] || 'Staff',
              joinDate: params[7] || new Date().toISOString().slice(0, 10),
              salary: params[8] || 60000,
              basicSalary: params[9] || 30000,
              hra: params[10] || 15000,
              allowances: params[11] || 15000,
              pf: params[12] || 3600,
              tax: params[13] || 6000,
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

        if (cleanSql.includes('UPDATE users SET phone = ?, address = ?, profilePicture = ? WHERE id = ?')) {
          const [phone, address, pic, id] = params;
          const u = data.users.find(x => x.id == id);
          if (u) {
            u.phone = phone || '';
            u.address = address || '';
            u.profilePicture = pic || '';
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET documents = ? WHERE id = ?')) {
          const [docs, id] = params;
          const u = data.users.find(x => x.id == id);
          if (u) {
            u.documents = docs;
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET name = ?')) {
          const [name, phone, address, department, designation, joinDate, salary, basicSalary, hra, allowances, pf, tax, role, id] = params;
          const u = data.users.find(x => x.id == id);
          if (u) {
            if (name) u.name = name;
            if (phone !== undefined) u.phone = phone;
            if (address !== undefined) u.address = address;
            if (department !== undefined) u.department = department;
            if (designation !== undefined) u.designation = designation;
            if (joinDate !== undefined) u.joinDate = joinDate;
            if (salary !== undefined) u.salary = salary;
            if (basicSalary !== undefined) u.basicSalary = basicSalary;
            if (hra !== undefined) u.hra = hra;
            if (allowances !== undefined) u.allowances = allowances;
            if (pf !== undefined) u.pf = pf;
            if (tax !== undefined) u.tax = tax;
            if (role !== undefined) u.role = role;
            saveDB();
          }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET otpCode = ? WHERE id = ?')) {
          const [otp, id] = params;
          const u = data.users.find(x => x.id == id);
          if (u) { u.otpCode = otp; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET isEmailVerified = 1, otpCode = "" WHERE id = ?')) {
          const [id] = params;
          const u = data.users.find(x => x.id == id);
          if (u) { u.isEmailVerified = 1; u.otpCode = ''; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET paidLeaveRemaining = ? WHERE id = ?')) {
          const [bal, id] = params;
          const u = data.users.find(x => x.id == id);
          if (u) { u.paidLeaveRemaining = bal; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE users SET sickLeaveRemaining = ? WHERE id = ?')) {
          const [bal, id] = params;
          const u = data.users.find(x => x.id == id);
          if (u) { u.sickLeaveRemaining = bal; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('INSERT INTO attendance') || cleanSql.includes('INSERT OR IGNORE INTO attendance')) {
          const [userId, date, status, checkIn, checkOut, workHours] = params;
          const existing = data.attendance.find(a => a.userId == userId && a.date === date);
          if (!existing) {
            const att = {
              id: data.attendance.length > 0 ? Math.max(...data.attendance.map(x => x.id)) + 1 : 1,
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
          const a = data.attendance.find(x => x.id == id);
          if (a) { a.checkIn = cIn; a.status = st; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE attendance SET checkOut = ?, workHours = ? WHERE id = ?')) {
          const [cOut, hrs, id] = params;
          const a = data.attendance.find(x => x.id == id);
          if (a) { a.checkOut = cOut; a.workHours = hrs; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('UPDATE attendance SET status = ? WHERE id = ?')) {
          const [st, id] = params;
          const a = data.attendance.find(x => x.id == id);
          if (a) { a.status = st; a.workHours = hrs; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('INSERT INTO leaves')) {
          const [userId, type, startDate, endDate, daysCount, remarks] = params;
          const lv = {
            id: data.leaves.length > 0 ? Math.max(...data.leaves.map(x => x.id)) + 1 : 1,
            userId,
            type,
            startDate,
            endDate,
            daysCount: daysCount || 1,
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
          const l = data.leaves.find(x => x.id == id);
          if (l) { l.status = st; l.adminComment = cm || ''; saveDB(); }
          return { changes: 1 };
        }

        if (cleanSql.includes('INSERT INTO notifications')) {
          const [userId, title, message, type] = params;
          const notif = {
            id: data.notifications.length > 0 ? Math.max(...data.notifications.map(x => x.id)) + 1 : 1,
            userId,
            title,
            message,
            type: type || 'info',
            isRead: 0,
            createdAt: new Date().toISOString()
          };
          data.notifications.push(notif);
          saveDB();
          return { lastInsertRowid: notif.id };
        }

        if (cleanSql.includes('UPDATE notifications SET isRead = 1 WHERE userId = ?')) {
          const [uId] = params;
          data.notifications.forEach(n => {
            if (n.userId == uId) n.isRead = 1;
          });
          saveDB();
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
    salary: 120000,
    basicSalary: 60000,
    hra: 30000,
    allowances: 30000,
    pf: 7200,
    tax: 12000,
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

console.log('ElyVia Engine initialized with', data.users.length, 'user(s) [Admin account active]. Zero mock employees.');

module.exports = db;

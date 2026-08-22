const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFile = path.join(__dirname, 'dayflow_db.json');

// Memory store backed by JSON file
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

// Database Mock Engine matching better-sqlite3 prepared statement API
const db = {
  pragma: () => {},
  exec: (sql) => {
    // Schema creation helper placeholder
  },
  prepare: (sqlStr) => {
    const cleanSql = sqlStr.trim().replace(/\s+/g, ' ');

    return {
      get: (...params) => {
        // SELECT users WHERE email = ? OR employeeId = ?
        if (cleanSql.includes('FROM users WHERE email = ? OR employeeId = ?')) {
          const [email, empId] = params;
          return data.users.find(u => u.email === email || u.employeeId === empId);
        }
        if (cleanSql.includes('FROM users WHERE email = ?')) {
          const [email] = params;
          return data.users.find(u => u.email === email);
        }
        if (cleanSql.includes('FROM users WHERE id = ?')) {
          const [id] = params;
          return data.users.find(u => u.id == id);
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
        if (cleanSql.includes('FROM attendance WHERE userId = ? AND date = ?')) {
          const [uId, d] = params;
          return data.attendance.find(a => a.userId == uId && a.date === d);
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
        // Users SELECT all
        if (cleanSql.includes('FROM users') && !cleanSql.includes('JOIN')) {
          return data.users.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Attendance SELECT all
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

        // Leaves SELECT all
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

        // Analytics Department Stats
        if (cleanSql.includes('SELECT department, COUNT(*) as count FROM users GROUP BY department')) {
          const map = {};
          data.users.forEach(u => {
            const d = u.department || 'Unassigned';
            map[d] = (map[d] || 0) + 1;
          });
          return Object.keys(map).map(dept => ({ department: dept, count: map[dept] }));
        }

        // Analytics Leave Stats
        if (cleanSql.includes('SELECT type, COUNT(*) as count FROM leaves GROUP BY type')) {
          const map = {};
          data.leaves.forEach(l => {
            map[l.type] = (map[l.type] || 0) + 1;
          });
          return Object.keys(map).map(t => ({ type: t, count: map[t] }));
        }

        // Notifications SELECT all
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
        let lastInsertRowid = Date.now();

        // INSERT INTO users
        if (cleanSql.includes('INSERT INTO users')) {
          const u = {
            id: data.users.length > 0 ? Math.max(...data.users.map(x => x.id)) + 1 : 1,
            employeeId: params[0],
            name: params[1],
            email: params[2],
            password: params[3],
            role: params[4],
            phone: params[15] || params[5] || '',
            address: params[16] || params[6] || '',
            department: params[5] || '',
            designation: params[6] || '',
            joinDate: params[7] || new Date().toISOString().slice(0, 10),
            salary: params[8] || 60000,
            basicSalary: params[9] || 30000,
            hra: params[10] || 15000,
            allowances: params[11] || 15000,
            pf: params[12] || 3600,
            tax: params[13] || 6000,
            isEmailVerified: params[14] !== undefined ? params[14] : (params[5] === 0 ? 0 : 1),
            otpCode: params[6] || '',
            documents: params[18] || '[]',
            profilePicture: params[17] || '',
            paidLeaveRemaining: 12,
            sickLeaveRemaining: 8,
            createdAt: new Date().toISOString()
          };
          data.users.push(u);
          saveDB();
          return { lastInsertRowid: u.id };
        }

        // UPDATE users
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

        // Attendance INSERT & UPDATE
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
          if (a) { a.status = st; saveDB(); }
          return { changes: 1 };
        }

        // Leaves INSERT & UPDATE
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

        // Notifications INSERT & UPDATE
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

// Seed default users and data if empty
if (data.users.length === 0) {
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const empHash = bcrypt.hashSync('Employee@123', 10);

  data.users.push({
    id: 1,
    employeeId: 'EMP-ADMIN',
    name: 'Sarah Jenkins',
    email: 'admin@dayflow.com',
    password: adminHash,
    role: 'Admin',
    department: 'Human Resources',
    designation: 'VP of HR Operations',
    joinDate: '2023-01-15',
    salary: 120000,
    basicSalary: 60000,
    hra: 30000,
    allowances: 30000,
    pf: 7200,
    tax: 12000,
    isEmailVerified: 1,
    phone: '+1 (555) 019-2834',
    address: '100 Executive Blvd, Suite 400',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    documents: JSON.stringify([{ id: 'doc-admin-1', name: 'HR_Policy_Manual.pdf', type: 'Policy', date: '2023-01-15', size: '2.4 MB' }]),
    paidLeaveRemaining: 12,
    sickLeaveRemaining: 8,
    createdAt: new Date().toISOString()
  });

  const sampleEmps = [
    {
      id: 2, employeeId: 'EMP-101', name: 'Alex Morgan', email: 'alex.morgan@dayflow.com', department: 'Engineering', designation: 'Senior Full Stack Lead',
      joinDate: '2023-03-10', salary: 95000, basic: 47500, hra: 23750, allow: 23750, pf: 5700, tax: 9500, phone: '+1 (555) 234-5678', address: '42 Tech Way, San Jose, CA',
      pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3, employeeId: 'EMP-102', name: 'David Chen', email: 'david.chen@dayflow.com', department: 'Product Design', designation: 'Principal UX Architect',
      joinDate: '2023-06-01', salary: 88000, basic: 44000, hra: 22000, allow: 22000, pf: 5280, tax: 8800, phone: '+1 (555) 345-6789', address: '788 Market St, San Francisco, CA',
      pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 4, employeeId: 'EMP-103', name: 'Elena Rostova', email: 'elena.r@dayflow.com', department: 'Marketing', designation: 'Growth & Brand Director',
      joinDate: '2023-09-15', salary: 82000, basic: 41000, hra: 20500, allow: 20500, pf: 4920, tax: 8200, phone: '+1 (555) 456-7890', address: '120 Madison Ave, New York, NY',
      pic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 5, employeeId: 'EMP-104', name: 'Marcus Vance', email: 'marcus.vance@dayflow.com', department: 'Sales', designation: 'Enterprise Account Executive',
      joinDate: '2024-01-08', salary: 76000, basic: 38000, hra: 19000, allow: 19000, pf: 4560, tax: 7600, phone: '+1 (555) 567-8901', address: '55 Austin Tech Ridge, Austin, TX',
      pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
    }
  ];

  for (const emp of sampleEmps) {
    data.users.push({
      id: emp.id,
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      password: empHash,
      role: 'Employee',
      department: emp.department,
      designation: emp.designation,
      joinDate: emp.joinDate,
      salary: emp.salary,
      basicSalary: emp.basic,
      hra: emp.hra,
      allowances: emp.allow,
      pf: emp.pf,
      tax: emp.tax,
      isEmailVerified: 1,
      phone: emp.phone,
      address: emp.address,
      profilePicture: emp.pic,
      documents: JSON.stringify([
        { id: `doc-${emp.id}-1`, name: 'Employment_Contract.pdf', type: 'Contract', date: emp.joinDate, size: '1.2 MB' },
        { id: `doc-${emp.id}-2`, name: 'Identity_Verification.pdf', type: 'ID Proof', date: emp.joinDate, size: '850 KB' }
      ]),
      paidLeaveRemaining: 12,
      sickLeaveRemaining: 8,
      createdAt: new Date().toISOString()
    });
  }

  // Sample Leaves
  data.leaves.push(
    {
      id: 1, userId: 2, type: 'Paid', startDate: '2026-08-25', endDate: '2026-08-27', daysCount: 3,
      remarks: 'Annual family vacation', status: 'Pending', adminComment: '', createdAt: new Date().toISOString()
    },
    {
      id: 2, userId: 3, type: 'Sick', startDate: '2026-08-10', endDate: '2026-08-11', daysCount: 2,
      remarks: 'Doctor consultation & rest', status: 'Approved', adminComment: 'Approved. Get well soon!', createdAt: new Date().toISOString()
    }
  );

  // Sample Recent Attendance
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    data.users.forEach((u) => {
      data.attendance.push({
        id: data.attendance.length + 1,
        userId: u.id,
        date: dateStr,
        status: i === 2 && u.id === 3 ? 'Leave' : 'Present',
        checkIn: '09:00:00',
        checkOut: '17:30:00',
        workHours: 8.5
      });
    });
  }

  saveDB();
}

console.log('Dayflow Pure JS Database initialized with', data.users.length, 'users');

module.exports = db;

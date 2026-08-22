const express = require('express');
const cors = require('cors');
require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/contact', require('./routes/contact'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ElyVia HRMS API', version: '3.0.0' }));

// Catch-all 404 logger for debugging missing API endpoints
app.use((req, res) => {
  console.warn(`[404 Not Found] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ElyVia HRMS backend running on http://localhost:${PORT}`));

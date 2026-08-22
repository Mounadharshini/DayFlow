const express = require('express');
const cors = require('cors');
require('./db'); // initializes DB + seeds admin & sample employees

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

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Dayflow HRMS API', version: '2.0.0' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Dayflow HRMS backend running on http://localhost:${PORT}`));

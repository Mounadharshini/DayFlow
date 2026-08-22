const express = require('express');
const db = require('../db');
const { sendMail } = require('../mailer');

const router = express.Router();

// Public / User Contact Form Submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message content are required.' });
    }

    const title = `📩 New HR Inquiry: ${subject || 'General Inquiry'}`;
    const fullMsg = `Inquiry submitted by ${name} (${email}): "${message}"`;

    // 1. Notify ALL Admin Users in Database
    const admins = db.prepare(`SELECT id FROM users WHERE role = 'Admin'`).all() || [];
    admins.forEach(admin => {
      db.prepare(`INSERT INTO notifications (userId, title, message, type) VALUES (?,?,?,?)`)
        .run(admin.id, title, fullMsg, 'info');
    });

    // 2. Dispatch Email to Official Admin Address
    sendMail({
      to: 'admin@elyvia.com',
      subject: `ElyVia HRMS — ${subject || 'New Contact Inquiry'} from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee5d8; border-radius: 14px; background: #ffffff;">
          <h3 style="color: #b37a4c; margin-top: 0;">New Support Inquiry Received</h3>
          <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
          <p><strong>Category:</strong> ${subject || 'General'}</p>
          <div style="background: #fdfaf6; border: 1px solid #eee5d8; padding: 16px; border-radius: 10px; margin: 16px 0; font-size: 14px; color: #2b1b12;">
            ${message}
          </div>
          <p style="font-size: 12px; color: #7a6758;">Dispatched to HR Admin Portal &bull; admin@elyvia.com</p>
        </div>
      `
    }).catch(() => {});

    res.status(201).json({ success: true, message: 'Your message has been routed to HR Administration' });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({ error: 'Failed to process inquiry message' });
  }
});

module.exports = router;

const nodemailer = require('nodemailer');
require('dotenv').config();

const userEmail = (process.env.SMTP_USER || 'dhachumaa182@gmail.com').trim();
const userPass = (process.env.SMTP_PASS || 'bhkskncueqsxlijs').replace(/\s+/g, '').trim();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: userEmail,
    pass: userPass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendMail({ to, subject, html, text }) {
  try {
    console.log(`[SMTP] Attempting to send email to "${to}" via ${userEmail}...`);
    const info = await transporter.sendMail({
      from: `"Dayflow HRMS" <${userEmail}>`,
      to,
      subject,
      text: text || '',
      html: html || text,
    });
    console.log('[SMTP] ✅ Email successfully delivered! MessageID:', info.messageId, 'Recipient:', to);
    return true;
  } catch (err) {
    console.error('[SMTP] ❌ Failed to deliver email:', err.message);
    return false;
  }
}

module.exports = { sendMail };

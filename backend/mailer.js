const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: (process.env.SMTP_USER || 'dhachumaa182@gmail.com').trim(),
    pass: (process.env.SMTP_PASS || 'bhkskncueqsxlijs').replace(/\s+/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendMail({ to, subject, html, text }) {
  const mailOptions = {
    from: '"ElyVia HRMS" <dhachumaa182@gmail.com>',
    to,
    subject,
    text: text || 'Message from ElyVia HRMS',
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP Mailer] Real email dispatched to ${to} | Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[SMTP Mailer Error] Failed sending email to ${to}:`, err.message);
    throw err;
  }
}

module.exports = { sendMail };

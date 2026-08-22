const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'dhachumaa182@gmail.com',
    pass: process.env.SMTP_PASS || 'bhkskncueqsxlijs',
  },
});

/**
 * Send email helper
 * @param {Object} options { to, subject, html, text }
 */
async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"Dayflow HRMS" <${process.env.SMTP_USER || 'dhachumaa182@gmail.com'}>`,
      to,
      subject,
      text: text || '',
      html: html || text,
    });
    console.log('Real Email Sent:', info.messageId, 'to:', to);
    return true;
  } catch (err) {
    console.error('Failed to send email via Gmail SMTP:', err.message);
    return false;
  }
}

module.exports = { sendMail };

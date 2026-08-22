const path = require('path');
const { sendMail } = require(path.join(__dirname, 'mailer'));

async function test() {
  console.log('Sending test email to dhachumaa182@gmail.com...');
  const success = await sendMail({
    to: 'dhachumaa182@gmail.com',
    subject: 'Dayflow HRMS Test Email',
    html: '<h1>Dayflow HRMS Gmail Integration Working!</h1><p>Your Gmail App Password integration is fully functional.</p>'
  });
  console.log('Test result:', success);
}

test();

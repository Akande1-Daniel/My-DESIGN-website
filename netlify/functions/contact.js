const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid JSON payload.' }),
    };
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Please provide your name, email, and message.' }),
    };
  }

  const SMTP_HOST = process.env.SMTP_HOST || '';
  const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
  const SMTP_USER = process.env.SMTP_USER || '';
  const SMTP_PASS = process.env.SMTP_PASS || '';
  let EMAIL_TO = process.env.EMAIL_TO || process.env.SMTP_USER || '';
  let etherealFrom = null;
  let usingEthereal = false;

  let transporter;
  try {
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      await transporter.verify();
    } else {
      const testAccount = await nodemailer.createTestAccount();
      usingEthereal = true;
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      etherealFrom = testAccount.user;
      EMAIL_TO = EMAIL_TO || testAccount.user;
    }
  } catch (error) {
    console.error('Failed to configure transporter:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Failed to configure email sender.' }),
    };
  }

  const mail = {
    from: SMTP_USER || etherealFrom || EMAIL_TO || 'no-reply@example.com',
    to: EMAIL_TO,
    subject: `New contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`,
  };

  try {
    const info = await transporter.sendMail(mail);
    const result = { success: true, message: 'Thank you! Your message has been received and emailed.' };
    if (usingEthereal) {
      result.previewUrl = nodemailer.getTestMessageUrl(info);
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Message received but failed to send email.' }),
    };
  }
};

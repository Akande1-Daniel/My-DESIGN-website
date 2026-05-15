const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '..', 'Front end');
const logPath = path.join(__dirname, 'messages.log');

// Read SMTP configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
let EMAIL_TO = process.env.EMAIL_TO || process.env.SMTP_USER || '';
let etherealFrom = null;

let transporter = null;
let usingEthereal = false;
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
  transporter.verify().then(() => {
    console.log('SMTP transporter verified');
  }).catch((err) => {
    console.error('Failed to verify SMTP transporter:', err.message || err);
    transporter = null;
  });
} else {
  // Create an Ethereal test account so developers can preview messages
  nodemailer.createTestAccount().then((testAccount) => {
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
    console.log('Ethereal test account created — messages will be sent to Ethereal.');
    console.log('Ethereal user:', testAccount.user);
    console.log('Ethereal pass:', testAccount.pass);
  }).catch((err) => {
    console.error('Failed to create Ethereal test account:', err && err.message ? err.message : err);
    transporter = null;
  });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(publicPath));

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide your name, email, and message.' });
  }

  const submission = {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    receivedAt: new Date().toISOString(),
  };

  const logLine = JSON.stringify(submission) + '\n';
  fs.appendFile(logPath, logLine, (err) => {
    if (err) {
      console.error('Failed to save contact message:', err);
    }
  });

  console.log('Contact message received:', submission);
  // Attempt to send email if transporter is configured
  if (transporter && EMAIL_TO) {
    const mail = {
      from: SMTP_USER || etherealFrom || EMAIL_TO || 'no-reply@example.com',
      to: EMAIL_TO,
      subject: `New contact from ${submission.name}`,
      text: `Name: ${submission.name}\nEmail: ${submission.email}\nMessage:\n${submission.message}`,
      html: `<p><strong>Name:</strong> ${submission.name}</p><p><strong>Email:</strong> ${submission.email}</p><p><strong>Message:</strong><br/>${submission.message.replace(/\n/g,'<br/>')}</p>`,
    };

    transporter.sendMail(mail, (err, info) => {
      if (err) {
        console.error('Failed to send contact email:', err);
        return res.status(500).json({ success: false, message: 'Message received but failed to send email.' });
      }
      console.log('Contact email sent:', info && info.messageId);
      if (usingEthereal) {
        const preview = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL:', preview);
        return res.json({ success: true, message: 'Thank you! Your message has been received and emailed (preview available).', previewUrl: preview });
      }
      return res.json({ success: true, message: 'Thank you! Your message has been received and emailed.' });
    });
  } else {
    return res.json({ success: true, message: 'Thank you! Your message has been received (email not sent; SMTP not configured).' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

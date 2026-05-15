# Dedan Design Backend

This backend provides a contact form API for the Dedan Design website.

## Setup

1. Open a terminal in the `Back end` folder.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open the site at `http://localhost:3000`.

### Email delivery (optional)

To receive contact submissions by email, create a `.env` file in the `Back end` folder with SMTP settings. You can copy the example:

```text
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username@example.com
SMTP_PASS=your-smtp-password
EMAIL_TO=you@yourdomain.com
```

If SMTP settings are not provided, contact messages will still be logged to `Back end/messages.log` but will not be emailed.

When SMTP is not configured, the server now automatically creates an Ethereal test account and sends messages there. The API response will include a `previewUrl` field when Ethereal is used, and the server logs also print the preview URL. Open that URL in your browser to view the test message.

## API

- `POST /api/contact`
  - body: `{ name, email, message }`
  - returns: JSON success message

Contact submissions are appended to `Back end/messages.log`.

## Testing email without a live SMTP server

If you don't have SMTP credentials, you can use a service like Mailtrap or Ethereal to test email delivery. Configure the SMTP settings accordingly and restart the server.

# Dedan Design

This repository contains the Dedan Design website and a Netlify function for contact form email delivery.

## Deployment notes

The contact form uses a Netlify function at `netlify/functions/contact.js` to send emails.

### Required Netlify environment variables

Set these values in your Netlify site dashboard under `Site settings` → `Build & deploy` → `Environment` → `Environment variables`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_TO`

### Example values for Gmail SMTP

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=<your-app-password>
EMAIL_TO=your-email@gmail.com
```

### Important

- Do not store your real SMTP credentials in source control.
- Prefer Netlify environment variables over `netlify.toml` for sensitive data.
- After updating env vars, trigger a redeploy so the function can use them.

## Local development

The frontend is in `Front end/` and the Netlify function is in `netlify/functions/`.

If you're testing locally, the backend may create a temporary Ethereal email account when SMTP settings are not configured.

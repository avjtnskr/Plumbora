const nodemailer = require('nodemailer');

const createTransporter = () => {
  const missing = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'].filter((key) => !process.env[key]);
  if (missing.length) {
    return { transporter: null, missing };
  }

  return {
    transporter: nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }),
    missing: [],
  };
};

exports.sendEmail = async ({ to, subject, html, text }) => {
  const { transporter, missing } = createTransporter();

  if (!transporter) {
    console.warn('[email:not-sent]', { to, subject, missing });
    return { preview: true, missing };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });

  console.log('[email:sent]', {
    to,
    subject,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  return info;
};

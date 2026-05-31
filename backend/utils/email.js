const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

exports.sendEmail = async ({ to, subject, html, text }) => {
  // Check missing environment variable
  const missing = ['RESEND_API_KEY'].filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    console.warn('[email:not-sent]', {
      to,
      subject,
      missing,
    });

    return {
      preview: true,
      missing,
    };
  }

  // Timeout controller (20 sec)
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    20000
  );

  // Email sender
  const from =
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    'Plumbora <onboarding@resend.dev>';

  try {
    const response = await fetch(RESEND_EMAIL_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response
      .json()
      .catch(() => ({}));

    // Handle API error
    if (!response.ok) {
      const details =
        data.message ||
        data.error ||
        response.statusText;

      const error = new Error(
        `Resend email failed: ${details}`
      );

      error.code = `RESEND_${response.status}`;
      error.response = data;

      throw error;
    }

    console.log('[email:sent]', {
      provider: 'resend',
      to,
      subject,
      messageId: data.id,
    });

    return {
      messageId: data.id,
      accepted: [to],
      rejected: [],
      response: 'Queued by Resend',
    };
  } catch (error) {
    console.error('[email:error]', error);

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

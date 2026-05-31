const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const row = (label, value) => `
  <tr>
    <td style="padding:10px 12px;color:#557174;border-bottom:1px solid #e7f4f5;width:170px;">${label}</td>
    <td style="padding:10px 12px;color:#123436;border-bottom:1px solid #e7f4f5;font-weight:600;">${escapeHtml(value || 'N/A')}</td>
  </tr>
`;

const section = (title, rows) => `
  <h3 style="margin:24px 0 10px;color:#007A7E;font-size:16px;">${title}</h3>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;border:1px solid #e7f4f5;border-radius:8px;overflow:hidden;">
    ${rows}
  </table>
`;

module.exports = function bookingEmailTemplate(booking) {
  const user = booking.user || {};
  const plumber = booking.plumber || {};
  const service = booking.service || {};
  const customerName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const amount = booking.finalAmount || booking.amount || service.serviceCharges || 0;

  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f4fbfc;font-family:Arial,sans-serif;color:#123436;">
        <div style="max-width:720px;margin:0 auto;padding:24px;">
          <div style="background:#007A7E;color:white;padding:22px 24px;border-radius:10px 10px 0 0;">
            <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Plumbora</div>
            <h2 style="margin:8px 0 0;font-size:24px;">New Booking Assigned</h2>
          </div>
          <div style="background:#ffffff;padding:24px;border:1px solid #dceff1;border-top:0;border-radius:0 0 10px 10px;">
            <p style="margin:0 0 18px;line-height:1.6;">
              Hello ${escapeHtml(plumber.name || 'Technician')}, a new cash-on-delivery plumbing booking has been assigned to you.
            </p>

            ${section('Booking Details', [
              row('Booking ID', booking._id),
              row('Service', service.serviceName),
              row('Problem Details', booking.problemDetails),
              row('Service Charge', `₹${amount}`),
              row('Payment Mode', 'Cash on Delivery'),
            ].join(''))}

            ${section('Customer Details', [
              row('Name', customerName),
              row('Mobile', user.mobile),
              row('Email', user.email),
            ].join(''))}

            ${section('Visit Details', [
              row('Date', formatDate(booking.bookingDate)),
              row('Time', booking.bookingTime),
              row('Address', booking.serviceAddress),
              row('City', booking.city),
              row('Pincode', booking.pincode),
            ].join(''))}

            ${section('Admin Notes', [
              row('Notes', booking.adminNotes || booking.notes || 'Please contact the customer before visiting.'),
            ].join(''))}

            <p style="margin:22px 0 0;line-height:1.6;color:#3d6163;">
              Please contact the customer before arrival and collect cash only after completing the service.
            </p>
          </div>
          <div style="font-size:12px;color:#789194;text-align:center;padding:16px;">
            This is an automated booking assignment email from Plumbora.
          </div>
        </div>
      </body>
    </html>
  `;
};

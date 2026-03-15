const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Honeypot check
  if (req.body._gotcha) {
    return res.status(200).json({ success: true });
  }

  const { firstName, lastName, company, phone, email, subject, message } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !company || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"BioChem Website" <${process.env.GMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    replyTo: email,
    subject: `BioChem Website Contact: ${subject || 'General Inquiry'}`,
    text: [
      'You received a new message from the BioChem Technology website.',
      '',
      `Name:    ${firstName} ${lastName}`,
      `Company: ${company}`,
      `Phone:   ${phone || 'N/A'}`,
      `Email:   ${email}`,
      `Subject: ${subject || 'General Inquiry'}`,
      '',
      'Message:',
      message,
    ].join('\n'),
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}

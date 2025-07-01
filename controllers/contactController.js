// controllers/contactController.js
const mailSender = require('../utils/mailSender');

// POST /v1/contact
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Prepare email content (English)
    const htmlBody = `
      <h3>New Contact Message from Website</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b><br>${message}</p>
    `;
    await mailSender(
      'amedmohmed925@gmail.com',
      `New Contact Message: ${subject}`,
      htmlBody
    );
    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

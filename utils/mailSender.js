const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.EMAILTEST, // البريد الإلكتروني المسجل في Brevo
        pass: process.env.APIKEY    // SMTP Key
      },
    });

    let info = await transporter.sendMail({
      from: `"${process.env.EMAIL}" <${process.env.EMAILTEST}>`,
      to: email,
      subject: title,
      html: body,
    });
    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.log("Error sending email:", error.message);
  }
};

module.exports = mailSender;
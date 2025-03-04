const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'fanny.smitham@ethereal.email', // استبدل بهذا إذا كنت تستخدم حساب Ethereal آخر
        pass: 'xuzgk6sJGaJx6k7eRU', // استبدل بهذا إذا كنت تستخدم حساب Ethereal آخر
      },
      debug: true, // تفعيل التصحيح
      logger: true,
    });

    let info = await transporter.sendMail({
      from: `"Test App" <fanny.smitham@ethereal.email>`, // استبدل بهذا إذا كنت تستخدم حساب Ethereal آخر
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.log("Error sending email:", error);
    throw error;
  }
};

module.exports = mailSender;
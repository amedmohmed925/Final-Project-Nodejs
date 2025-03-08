const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {

    let transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAILTEST,
        pass: process.env.APIKE,
      },
    });


    let info = await transporter.sendMail({
      from: `"Courses " <Courses@gmail.com>`, 
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
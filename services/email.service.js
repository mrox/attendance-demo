const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    // secure: true,
    auth: {
      user: 'tuyen.appdev@gmail.com',
      pass: 'tnxpdqklsdobbyge'
    }
  });
  
  
// async..await is not allowed in global scope, must use a wrapper
async function sendNotificationEmail(email, content) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Attendance Notification" <info@jmt.vn>', // sender address
      to: email, // list of receivers
      subject: content.subject, // Subject line
      text: content.text, // plain text body
      html: content.html, // html body
    });

    console.log("Message sent: %s", info.messageId);
}

module.exports = {
    sendNotificationEmail
}
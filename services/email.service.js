const nodemailer = require("nodemailer");
const { emailList } = require("./teacher.service");

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
  try {
    // send mail with defined transport object
    transporter.sendMail({
      from: '"Attendance Notification" <info@jmt.vn>', // sender address
      to: email, // list of receivers
      subject: content.subject, // Subject line
      text: content.text, // plain text body
      html: content.html, // html body
    });

    console.log("------------ Email sent: %s", email, " ---- " );
    
  } catch (error) {
      console.log(error);
  }
}

async function sendEmailToTopic(topic, content) {
  const emails = emailList.get(topic);
  if(!emails) return;
  for (const email of emails) {
    if(email == "") continue;
    await sendNotificationEmail(email, content);
  }
}


module.exports = {
    sendNotificationEmail,
    sendEmailToTopic
}
const nodemailer = require("nodemailer");
const { emailList } = require("./teacher.service");

let transporter ;
try {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    // secure: true,
    auth: {
      user: 'tuyen.appdev@gmail.com',
      pass: 'tnxpdqklsdobbyge'
    }
  });
} catch (error) {
    console.log(error);
}

  
// async..await is not allowed in global scope, must use a wrapper
async function sendNotificationEmail(email, content) {
  if(!transporter) return;
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
    try {
      sendNotificationEmail(email, content);
      
    } catch (error) {
      console.log(error);
    }
  }
}


module.exports = {
    sendNotificationEmail,
    sendEmailToTopic
}
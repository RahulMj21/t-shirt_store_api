const nodemailer = require("nodemailer");

const sendMail = async (data) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secured: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "smilyweb", // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    html: data.html, // html body
  });
  return info;
};

module.exports = sendMail;

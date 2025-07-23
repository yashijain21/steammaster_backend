const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false, // Use true for port 465, false for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html, attachments }) => {
  await transporter.sendMail({
    from: `"SteamMaster" <steammaster973@gmail.com>`, // Use verified sender
    to,
    subject,
    html,
    attachments,
  });
};

module.exports = sendMail;

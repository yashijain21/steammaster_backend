const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html, attachments }) => {
  await transporter.sendMail({
    from: `"Your Business Name" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};

module.exports = sendMail;

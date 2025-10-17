const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 587, // default 587 if not set
  secure: process.env.MAIL_PORT === "465", // true for 465, false for 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certs
  },
  connectionTimeout: 15000, // 15 seconds
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

const sendMail = async ({ to, subject, html, attachments }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SteamMaster" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("⚠️ Sending email failed:", err.message);
    throw err; // propagate error so your route can handle it
  }
};

module.exports = sendMail;

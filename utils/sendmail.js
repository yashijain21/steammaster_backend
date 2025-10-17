const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendMail = async ({ to, subject, html, attachments }) => {
  try {
    const emailData = {
      sender: { name: "SteamMaster", email: "steammaster973@gmail.com" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      attachment: attachments
        ? attachments.map(file => ({
            name: file.filename,
            content: file.content ? file.content.toString('base64') : undefined,
            url: file.path ? file.path : undefined
          }))
        : []
    };

    const response = await apiInstance.sendTransacEmail(emailData);
    console.log("✅ Email sent via Brevo API:", response);
    return response;
  } catch (err) {
    console.error("⚠️ Brevo API Error:", err);
    throw err;
  }
};

module.exports = sendMail;

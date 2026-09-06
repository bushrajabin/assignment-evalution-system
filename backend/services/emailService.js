const nodemailer = require("nodemailer");

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.log("\n=== Password reset requested (no SMTP configured) ===");
    console.log(`To: ${toEmail}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log("Configure EMAIL_HOST / EMAIL_USER / EMAIL_PASS in backend/.env to send real emails.");
    console.log("======================================================\n");
    return { delivered: false, devLink: resetUrl };
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || EMAIL_USER,
    to: toEmail,
    subject: "Reset your Gradeline password",
    html: `
      <p>We received a request to reset your Gradeline password.</p>
      <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 30 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  return { delivered: true };
}

module.exports = { sendPasswordResetEmail };
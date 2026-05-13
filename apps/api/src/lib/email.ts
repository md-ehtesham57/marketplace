import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetLink: string
) => {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || "noreply@marketplace.local",
    to: email,
    subject: "Reset your Marketplace password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #0ea5e9; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <span style="color: white; font-size: 24px; font-weight: bold;">Marketplace</span>
        </div>
        <div style="padding: 32px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h1 style="font-size: 20px; color: #1e293b; margin: 0 0 8px;">Hi ${firstName},</h1>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your Marketplace password. Click the button below to set a new password. This link expires in 1 hour.
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetLink}" style="display: inline-block; background: #0ea5e9; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            If you didn't request this, you can safely ignore this email. Your password won't change unless you click the link above.
          </p>
        </div>
      </div>
    `,
  });
};

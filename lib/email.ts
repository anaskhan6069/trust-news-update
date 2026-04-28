import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export interface AdminNotificationInput {
  authorName: string;
  authorEmail: string;
  title: string;
  category: string;
  timestamp?: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: getRequiredEnv("SMTP_USER"),
        pass: getRequiredEnv("SMTP_PASS")
      }
    });
  }

  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendAdminNotification(input: AdminNotificationInput): Promise<void> {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const subject = `New News Submission: ${input.title}`;
  const adminEmail = getRequiredEnv("ADMIN_EMAIL");

  await getTransporter().sendMail({
    from: `"Trust News" <${getRequiredEnv("SMTP_USER")}>`,
    to: adminEmail,
    subject,
    text: [
      "A new news submission is waiting for approval.",
      "",
      `Author: ${input.authorName}`,
      `Email: ${input.authorEmail}`,
      `Title: ${input.title}`,
      `Category: ${input.category}`,
      `Timestamp: ${timestamp}`
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New news submission is waiting for approval</h2>
        <p><strong>Author:</strong> ${escapeHtml(input.authorName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.authorEmail)}</p>
        <p><strong>Title:</strong> ${escapeHtml(input.title)}</p>
        <p><strong>Category:</strong> ${escapeHtml(input.category)}</p>
        <p><strong>Timestamp:</strong> ${escapeHtml(timestamp)}</p>
      </div>
    `
  });
}

import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
});

const realm = process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep";

async function sendMail(opts: { to: string; subject: string; text: string; html: string }) {
  const from = process.env.MAIL_FROM ?? process.env.SMTP_FROM ?? "support@elwynnkeep.com";
  if (resend) {
    const { error } = await resend.emails.send({ from, ...opts });
    if (error) throw new Error(`Resend: ${error.message}`);
    return;
  }
  await transporter.sendMail({ from, ...opts });
}

export async function sendPasswordResetEmail(to: string, link: string) {
  await sendMail({
    to,
    subject: `${realm} password reset`,
    text: `A password reset was requested for your ${realm} account.\n\nSet a new password using this link (valid for 15 minutes):\n${link}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<p>A password reset was requested for your ${realm} account.</p>
<p>Set a new password using this link (valid for 15 minutes):<br /><a href="${link}">${link}</a></p>
<p>If you did not request this, you can safely ignore this email.</p>`,
  });
}

export async function sendWelcomeEmail(to: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elwynnkeep.com";
  const realmlist = process.env.NEXT_PUBLIC_REALMLIST ?? "logon.elwynnkeep.com";
  const text = `Welcome to ${realm}!

Your account has been created.

Log in to the website and the game client with your EMAIL: ${to}
Realmlist: ${realmlist}

Manage your account at ${siteUrl}/account

See you in game!`;
  await sendMail({
    to,
    subject: `Welcome to ${realm}`,
    text,
    html: `<p>Welcome to ${realm}!</p>
<p>Your account has been created.</p>
<p>Log in to the website and the game client with your <strong>email</strong>: <strong>${to}</strong><br />
Realmlist: <strong>${realmlist}</strong></p>
<p>Manage your account at <a href="${siteUrl}/account">${siteUrl}/account</a></p>
<p>See you in game!</p>`,
  });
}

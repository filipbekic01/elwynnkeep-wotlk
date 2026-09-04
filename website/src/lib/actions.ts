"use server";

import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { authDb } from "./db";
import { generateSaltAndVerifier, verifyPassword } from "./srp6";
import { createSession, destroySession, getSession } from "./session";

export type FormState = { error?: string; success?: string; email?: string; username?: string };

const USERNAME_RE = /^[a-zA-Z0-9]{3,16}$/;

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!USERNAME_RE.test(username)) {
    return { error: "Username must be 3-16 letters or numbers.", username, email };
  }
  if (!email || !email.includes("@")) return { error: "Enter a valid email address.", username, email };
  if (password.length < 6 || password.length > 16) return { error: "Password must be 6-16 characters.", username, email };
  if (password !== confirm) return { error: "Passwords do not match.", username, email };

  const [rows] = await authDb.query<RowDataPacket[]>(
    "SELECT id FROM account WHERE username = ? LIMIT 1",
    [username.toUpperCase()],
  );
  if (rows.length) return { error: "That username is already taken.", username, email };

  const { salt, verifier } = generateSaltAndVerifier(username, password);
  await authDb.query(
    "INSERT INTO account (username, salt, verifier, email, reg_mail, expansion, joindate) VALUES (?, ?, ?, ?, ?, 2, NOW())",
    [username.toUpperCase(), salt, verifier, email, email],
  );

  const [created] = await authDb.query<RowDataPacket[]>(
    "SELECT id FROM account WHERE username = ? LIMIT 1",
    [username.toUpperCase()],
  );
  const { sendWelcomeEmail } = await import("./mail");
  sendWelcomeEmail(email).catch((e) => console.error("Failed to send welcome email:", e));

  await createSession({ id: created[0].id, username: username.toUpperCase() });
  redirect("/account");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required.", email };

  // Emails are not guaranteed unique in the auth DB; try every matching account.
  const [rows] = await authDb.query<RowDataPacket[]>(
    "SELECT id, username, salt, verifier, totp_secret FROM account WHERE email = ? OR reg_mail = ?",
    [email, email],
  );
  const acc = rows.find((r) => verifyPassword(r.username, password, r.salt, r.verifier));
  if (!acc) return { error: "Invalid email or password.", email };

  if (acc.totp_secret) {
    const token = String(formData.get("token") ?? "").trim();
    const { verifyTotp } = await import("./totp");
    if (!token) return { error: "This account has 2FA enabled. Enter the 6-digit code from your app.", email };
    if (!verifyTotp(acc.totp_secret, token)) return { error: "Wrong 2FA code.", email };
  }

  await createSession({ id: acc.id, username: acc.username });
  redirect("/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordChangeAction(_prev: FormState, _formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const [rows] = await authDb.query<RowDataPacket[]>(
    "SELECT id, username, email, reg_mail FROM account WHERE id = ? LIMIT 1",
    [session.id],
  );
  const acc = rows[0];
  const email = acc?.email || acc?.reg_mail;
  if (!acc || !email) return { error: "No email address is set on this account." };

  const { createResetToken } = await import("./resetTokens");
  const { sendPasswordResetEmail } = await import("./mail");
  const token = createResetToken(acc.id, acc.username);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elwynnkeep.com";
  try {
    await sendPasswordResetEmail(email, `${siteUrl}/reset-password?token=${token}`);
  } catch (e) {
    console.error("Failed to send reset email:", e);
    return { error: "Could not send the email. Please try again later." };
  }
  return { success: "A link to set a new password has been sent to your email." };
}

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const generic = { success: "If an account exists for that email address, a reset link has been sent." };

  const [rows] = await authDb.query<RowDataPacket[]>(
    "SELECT id, username FROM account WHERE email = ? OR reg_mail = ? LIMIT 1",
    [email, email],
  );
  const acc = rows[0];
  if (!acc) return generic;

  const { createResetToken } = await import("./resetTokens");
  const { sendPasswordResetEmail } = await import("./mail");
  const token = createResetToken(acc.id, acc.username);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elwynnkeep.com";
  try {
    await sendPasswordResetEmail(email, `${siteUrl}/reset-password?token=${token}`);
  } catch (e) {
    console.error("Failed to send reset email:", e);
    return { error: "Could not send the email. Please try again later." };
  }
  return generic;
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6 || password.length > 16) return { error: "Password must be 6-16 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const { consumeResetToken } = await import("./resetTokens");
  const entry = token ? consumeResetToken(token) : null;
  if (!entry) return { error: "This reset link is invalid or has expired. Please request a new one." };

  const { salt, verifier } = generateSaltAndVerifier(entry.username, password);
  await authDb.query("UPDATE account SET salt = ?, verifier = ? WHERE id = ?", [salt, verifier, entry.accountId]);
  return { success: "Password updated. You can now log in with your new password." };
}

export type TotpState = FormState & { qr?: string; secret?: string };

export async function startTotpSetupAction(_prev: TotpState, _formData: FormData): Promise<TotpState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const { generateTotpSecret, base32Encode, otpauthUri } = await import("./totp");
  const { setPendingTotp } = await import("./pendingTotp");
  const QRCode = (await import("qrcode")).default;

  const secret = generateTotpSecret();
  setPendingTotp(session.id, secret);
  const secretBase32 = base32Encode(secret);
  const qr = await QRCode.toDataURL(otpauthUri(secretBase32, session.username), { margin: 1, width: 220 });
  return { qr, secret: secretBase32 };
}

export async function confirmTotpAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const code = String(formData.get("code") ?? "");
  const { getPendingTotp, clearPendingTotp } = await import("./pendingTotp");
  const { verifyTotp } = await import("./totp");

  const secret = getPendingTotp(session.id);
  if (!secret) return { error: "Setup expired. Please start again." };
  if (!verifyTotp(secret, code)) return { error: "Wrong code. Check your authenticator app and try again." };

  await authDb.query("UPDATE account SET totp_secret = ? WHERE id = ?", [secret, session.id]);
  clearPendingTotp(session.id);
  return { success: "Two-factor authentication is now enabled." };
}

export async function disableTotpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const code = String(formData.get("code") ?? "");
  const [rows] = await authDb.query<RowDataPacket[]>(
    "SELECT totp_secret FROM account WHERE id = ? LIMIT 1",
    [session.id],
  );
  const secret = rows[0]?.totp_secret as Buffer | null;
  if (!secret) return { error: "Two-factor authentication is not enabled." };

  const { verifyTotp } = await import("./totp");
  if (!verifyTotp(secret, code)) return { error: "Wrong code. Enter the current code from your app to disable 2FA." };

  await authDb.query("UPDATE account SET totp_secret = NULL WHERE id = ?", [session.id]);
  return { success: "Two-factor authentication has been disabled." };
}

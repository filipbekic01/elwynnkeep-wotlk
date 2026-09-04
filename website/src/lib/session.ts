import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "wow_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-secret-change-me");

export type Session = { id: number; username: string };

export async function createSession(data: Session) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as number, username: payload.username as string };
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

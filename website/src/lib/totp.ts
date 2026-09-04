import crypto from "crypto";

// RFC 6238 TOTP, matching AzerothCore's implementation: HMAC-SHA1, 6 digits, 30s period.
// The account.totp_secret column stores the RAW secret bytes (unencrypted while
// TOTPMasterSecret is blank in authserver.conf).

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function generateTotpSecret(): Buffer {
  return crypto.randomBytes(20);
}

function hotp(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac("sha1", secret).update(msg).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, "0");
}

/** Accepts the current 30s step ±1 for clock drift (same window the core allows). */
export function verifyTotp(secret: Buffer, token: string): boolean {
  const clean = token.replace(/\D/g, "");
  if (clean.length !== 6) return false;
  const step = Math.floor(Date.now() / 1000 / 30);
  for (const delta of [0, -1, 1]) {
    if (crypto.timingSafeEqual(Buffer.from(hotp(secret, step + delta)), Buffer.from(clean))) return true;
  }
  return false;
}

export function otpauthUri(secretBase32: string, accountName: string): string {
  const issuer = process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep";
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;
}

import { createHash, randomBytes, timingSafeEqual } from "crypto";

// AzerothCore SRP6 constants (3.3.5a)
const N = BigInt("0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7");
const g = BigInt(7);

function sha1(...parts: Buffer[]): Buffer {
  const h = createHash("sha1");
  for (const p of parts) h.update(p);
  return h.digest();
}

function leToBigInt(buf: Buffer): bigint {
  return BigInt("0x" + Buffer.from(buf).reverse().toString("hex"));
}

function bigIntToLe(n: bigint, size: number): Buffer {
  const hex = n.toString(16).padStart(size * 2, "0");
  return Buffer.from(hex, "hex").reverse();
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = BigInt(1);
  base %= mod;
  while (exp > 0) {
    if (exp & BigInt(1)) result = (result * base) % mod;
    exp >>= BigInt(1);
    base = (base * base) % mod;
  }
  return result;
}

export function calculateVerifier(username: string, password: string, salt: Buffer): Buffer {
  const h1 = sha1(Buffer.from(`${username.toUpperCase()}:${password.toUpperCase()}`, "utf8"));
  const h2 = sha1(salt, h1);
  const x = leToBigInt(h2);
  return bigIntToLe(modPow(g, x, N), 32);
}

export function generateSaltAndVerifier(username: string, password: string) {
  const salt = randomBytes(32);
  return { salt, verifier: calculateVerifier(username, password, salt) };
}

export function verifyPassword(username: string, password: string, salt: Buffer, verifier: Buffer): boolean {
  const computed = calculateVerifier(username, password, salt);
  return computed.length === verifier.length && timingSafeEqual(computed, verifier);
}

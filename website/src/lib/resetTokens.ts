import crypto from "crypto";

type Entry = { accountId: number; username: string; expires: number };

const TTL_MS = 15 * 60 * 1000;

// In-memory store; survives dev HMR via globalThis. Tokens are short-lived by design.
const store: Map<string, Entry> =
  ((globalThis as Record<string, unknown>).__resetTokens as Map<string, Entry>) ??
  ((globalThis as Record<string, unknown>).__resetTokens = new Map());

function prune() {
  const now = Date.now();
  for (const [k, v] of store) if (v.expires < now) store.delete(k);
}

export function createResetToken(accountId: number, username: string): string {
  prune();
  const token = crypto.randomBytes(32).toString("hex");
  store.set(token, { accountId, username, expires: Date.now() + TTL_MS });
  return token;
}

/** Returns and invalidates the entry, or null if unknown/expired. */
export function consumeResetToken(token: string): Entry | null {
  prune();
  const entry = store.get(token) ?? null;
  if (entry) store.delete(token);
  return entry;
}

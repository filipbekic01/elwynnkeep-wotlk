// In-memory pending TOTP secrets during enrollment (QR shown, not yet confirmed).

type Entry = { secret: Buffer; expires: number };

const TTL_MS = 10 * 60 * 1000;

const store: Map<number, Entry> =
  ((globalThis as Record<string, unknown>).__pendingTotp as Map<number, Entry>) ??
  ((globalThis as Record<string, unknown>).__pendingTotp = new Map());

export function setPendingTotp(accountId: number, secret: Buffer) {
  for (const [k, v] of store) if (v.expires < Date.now()) store.delete(k);
  store.set(accountId, { secret, expires: Date.now() + TTL_MS });
}

export function getPendingTotp(accountId: number): Buffer | null {
  const e = store.get(accountId);
  if (!e || e.expires < Date.now()) {
    store.delete(accountId);
    return null;
  }
  return e.secret;
}

export function clearPendingTotp(accountId: number) {
  store.delete(accountId);
}

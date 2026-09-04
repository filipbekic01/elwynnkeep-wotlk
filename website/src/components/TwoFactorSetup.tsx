"use client";

import { useActionState } from "react";
import {
  startTotpSetupAction,
  confirmTotpAction,
  disableTotpAction,
  type TotpState,
  type FormState,
} from "@/lib/actions";

export default function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [start, startAction, startPending] = useActionState<TotpState, FormData>(startTotpSetupAction, {});
  const [confirm, confirmAction, confirmPending] = useActionState<TotpState, FormData>(confirmTotpAction, {});
  const [disable, disableAction, disablePending] = useActionState<FormState, FormData>(disableTotpAction, {});

  if (enabled || disable.error || confirm.success) {
    // Enabled view (also right after a successful confirm, before the page revalidates)
    if (disable.success) return <p className="success-box">{disable.success}</p>;
    return (
      <div className="space-y-2">
        {confirm.success && <p className="success-box">{confirm.success}</p>}
        <p className="text-sm" style={{ color: "#5fd35f" }}>Two-factor authentication is enabled.</p>
        {disable.error && <p className="error-box">{disable.error}</p>}
        <form action={disableAction} className="flex gap-2">
          <input name="code" inputMode="numeric" pattern="[0-9]*" maxLength={6} className="input max-w-[140px]" required placeholder="6-digit code" />
          <button className="btn" type="submit" disabled={disablePending}>
            {disablePending ? "Disabling..." : "Disable 2FA"}
          </button>
        </form>
      </div>
    );
  }

  if (!start.qr) {
    return (
      <form action={startAction}>
        <button className="btn" type="submit" disabled={startPending}>
          {startPending ? "Preparing..." : "Enable 2FA"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Scan this QR code with an authenticator app (Google Authenticator, Aegis, 1Password, ...),
        then enter the 6-digit code to confirm.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={start.qr} alt="TOTP QR code" width={220} height={220} className="border border-[var(--border-hi)]" />
      <p className="text-sm" style={{ color: "var(--muted)" }}>Can&apos;t scan? Enter this secret manually:</p>
      <pre className="input overflow-x-auto px-3 py-3 text-base font-bold tracking-widest" style={{ color: "var(--gold)" }}>{start.secret}</pre>
      <p className="text-sm" style={{ color: "var(--gold-dim)" }}>
        Save this secret somewhere safe (e.g. a password manager). If you lose your device, entering it
        into a new authenticator app is the only way to restore your codes — it will not be shown again.
      </p>
      {confirm.error && <p className="error-box">{confirm.error}</p>}
      <form action={confirmAction} className="flex gap-2">
        <input name="code" inputMode="numeric" pattern="[0-9]*" maxLength={6} className="input max-w-[140px]" required placeholder="6-digit code" />
        <button className="btn btn-solid" type="submit" disabled={confirmPending}>
          {confirmPending ? "Verifying..." : "Confirm"}
        </button>
      </form>
    </div>
  );
}

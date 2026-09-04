"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "@/lib/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <div className="site py-12"><div className="mx-auto max-w-[420px]">
      <form action={action} className="panel space-y-4">
        <div className="panel-title">Account Login</div>
        {state.error && <p className="error-box">{state.error}</p>}
        <div>
          <label>Email</label>
          <input name="email" type="email" className="input mt-1" required autoComplete="email" placeholder="you@example.com" defaultValue={state.email} key={state.email} />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" className="input mt-1" required autoComplete="current-password" placeholder="Your password" />
        </div>
        <div>
          <label>2FA code <span className="font-normal" style={{ color: "var(--muted)" }}>— only if enabled</span></label>
          <input name="token" inputMode="numeric" pattern="[0-9]*" maxLength={6} className="input mt-1" autoComplete="one-time-code" placeholder="6-digit code" />
        </div>
        <div className="divider" />
        <button className="btn btn-solid w-full" type="submit" disabled={pending}>
          {pending ? "Signing in..." : "Login"}
        </button>
        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          No account? <Link href="/register">Register</Link> · <Link href="/forgot-password">Forgot password?</Link>
        </p>
      </form>
    </div></div>
  );
}

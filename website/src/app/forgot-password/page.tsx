"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type FormState } from "@/lib/actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  return (
    <div className="site py-12"><div className="mx-auto max-w-[420px]">
      <form action={action} className="panel space-y-4">
        <div className="panel-title">Forgot Password</div>
        {state.error && <p className="error-box">{state.error}</p>}
        {state.success && <p className="success-box">{state.success}</p>}
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Enter your account email and we will send you a link to set a new password.
        </p>
        <div>
          <label>Email</label>
          <input name="email" type="email" className="input mt-1" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="divider" />
        <button className="btn btn-solid w-full" type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send reset link"}
        </button>
        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          Remembered it? <Link href="/login">Login</Link>
        </p>
      </form>
    </div></div>
  );
}

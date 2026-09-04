"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/lib/actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});

  return (
    <div className="site py-12"><div className="mx-auto max-w-[420px]">
      <form action={action} className="panel space-y-4">
        <div className="panel-title">Create Account</div>
        {state.error && <p className="error-box">{state.error}</p>}
        <div>
          <label>Username</label>
          <input
            name="username"
            type="text"
            className="input mt-1"
            required
            minLength={3}
            maxLength={16}
            pattern="[a-zA-Z0-9]{3,16}"
            autoComplete="username"
            placeholder="3-16 letters or numbers"
            defaultValue={state.username ?? ""}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            className="input mt-1"
            required
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={state.email ?? ""}
          />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" className="input mt-1" required maxLength={16} autoComplete="new-password" placeholder="6-16 characters" />
        </div>
        <div>
          <label>Confirm password</label>
          <input name="confirm" type="password" className="input mt-1" required maxLength={16} autoComplete="new-password" placeholder="Repeat your password" />
        </div>
        <div className="divider" />
        <button className="btn btn-solid w-full" type="submit" disabled={pending}>
          {pending ? "Creating..." : "Register"}
        </button>
        <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
    </div></div>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type FormState } from "@/lib/actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="panel space-y-4">
      <div className="panel-title">Set New Password</div>
      {state.error && <p className="error-box">{state.error}</p>}
      {state.success ? (
        <>
          <p className="success-box">{state.success}</p>
          <Link href="/login" className="btn btn-solid block w-full text-center">Go to Login</Link>
        </>
      ) : (
        <>
          <input type="hidden" name="token" value={token} />
          <div>
            <label>New password</label>
            <input name="password" type="password" className="input mt-1" required autoComplete="new-password" placeholder="6-16 characters" />
          </div>
          <div>
            <label>Confirm password</label>
            <input name="confirm" type="password" className="input mt-1" required autoComplete="new-password" placeholder="Repeat new password" />
          </div>
          <div className="divider" />
          <button className="btn btn-solid w-full" type="submit" disabled={pending}>
            {pending ? "Saving..." : "Set password"}
          </button>
        </>
      )}
    </form>
  );
}

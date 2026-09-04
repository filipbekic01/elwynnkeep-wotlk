"use client";

import { useActionState } from "react";
import { requestPasswordChangeAction, type FormState } from "@/lib/actions";

export default function ChangePasswordButton() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordChangeAction, {});
  return (
    <form action={action} className="space-y-2">
      {state.error && <p className="error-box">{state.error}</p>}
      {state.success ? (
        <p className="success-box">{state.success}</p>
      ) : (
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Sending..." : "Request Password Reset"}
        </button>
      )}
    </form>
  );
}

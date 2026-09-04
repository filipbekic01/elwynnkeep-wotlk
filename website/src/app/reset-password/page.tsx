import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <div className="site py-12"><div className="mx-auto max-w-[420px]">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="panel space-y-4">
          <div className="panel-title">Reset Password</div>
          <p style={{ color: "var(--muted)" }}>
            This page requires a reset link. <Link href="/forgot-password">Request one here</Link>.
          </p>
        </div>
      )}
    </div></div>
  );
}

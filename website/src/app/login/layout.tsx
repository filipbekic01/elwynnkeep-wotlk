import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your Elwynnkeep game account.",
  alternates: { canonical: "/login" },
};

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  if (await getSession()) redirect("/account");
  return children;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free Elwynnkeep game account and start playing on the 3.3.5a realm today. No pay-to-win, no cash shop.",
  alternates: { canonical: "/register" },
};

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
  if (await getSession()) redirect("/account");
  return children;
}

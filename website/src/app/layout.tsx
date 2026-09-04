import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Nav from "@/components/Nav";

const realmName = process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elwynnkeep.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${realmName} — 3.3.5a Private Server`,
    template: `%s — ${realmName}`,
  },
  description: `${realmName} is a free, community-driven 3.3.5a private server powered by the open-source AzerothCore emulator. No pay-to-win, no cash shop.`,
  keywords: ["3.3.5a", "private server", "AzerothCore", realmName, "server emulator", "open source"],
  applicationName: realmName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: realmName,
    title: `${realmName} — 3.3.5a Private Server`,
    description: `Free, community-driven 3.3.5a private server powered by the open-source AzerothCore emulator. No pay-to-win.`,
    url: "/",
    images: [{ url: "/img/banner.jpg", width: 1200, height: 400, alt: `${realmName} banner` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${realmName} — 3.3.5a Private Server`,
    description: `Free, community-driven 3.3.5a private server powered by the open-source AzerothCore emulator.`,
    images: ["/img/banner.jpg"],
  },
  robots: { index: true, follow: true },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: realmName,
              url: siteUrl,
              description: "Free, community-driven 3.3.5a private server powered by the open-source AzerothCore emulator.",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/armory?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Nav />
        <main className="flex-1 page-bg">{children}</main>
        <footer className="nav-bar px-4 py-4 text-center text-sm" style={{ color: "var(--muted)", borderTop: "2px solid var(--border)", borderBottom: 0 }}>
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep"} · Powered by AzerothCore · <Link href="/terms">Terms of Use</Link> · <Link href="/privacy">Privacy Policy</Link> · <a href="mailto:support@elwynnkeep.com">support@elwynnkeep.com</a>
        </footer>
      </body>
    </html>
  );
}

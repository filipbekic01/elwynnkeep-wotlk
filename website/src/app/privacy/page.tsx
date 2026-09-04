import type { Metadata } from "next";

const realm = process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How the ${realm} website collects, uses, and protects your information.`,
  alternates: { canonical: "/privacy" },
};

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="mb-2 text-lg font-bold uppercase" style={{ color: "var(--gold)" }}>{title}</h2>
    <div className="space-y-3" style={{ color: "var(--muted)" }}>{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="site py-12"><div className="mx-auto max-w-[860px]">
      <div className="panel">
        <div className="panel-title">Privacy Policy</div>
        <div className="space-y-6">
          <S title="What We Collect">
            <p>
              When registering an account you are asked for a username, an email address, and a password. Passwords are
              never stored in plain text: authentication uses the SRP6 protocol, so only a cryptographic verifier is
              kept. Standard technical information (such as IP addresses and access logs) may be recorded automatically
              to operate and protect the service.
            </p>
          </S>
          <S title="How We Use Information">
            <p>
              Collected information is used solely to operate the realm: identifying your account, responding to support
              requests, and protecting the service against abuse. We do not use your information for marketing, and we do
              not send unsolicited email.
            </p>
          </S>
          <S title="Cookies">
            <p>
              The Site uses a single session cookie to keep you logged in to your account. No advertising or third-party
              tracking cookies are used. If you disable cookies in your browser, logging in will not work.
            </p>
          </S>
          <S title="Third Parties">
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
              The Site does not embed third-party advertising or behavioral tracking. Item and achievement data shown in
              the armory is fetched from public community databases; no personal information is sent to them.
            </p>
          </S>
          <S title="Data Protection">
            <p>
              Personal information is stored on secured servers accessible only to the operator. Reasonable technical
              measures, including encrypted transport (HTTPS) and hashed credentials, are used to protect submitted
              information. However, no method of transmission or storage is completely secure, and absolute security
              cannot be guaranteed.
            </p>
          </S>
          <S title="Your Rights">
            <p>
              You can review and change your account information by logging in to your account. You may request removal
              of your account and associated personal information at any time by emailing{" "}
              <a href="mailto:support@elwynnkeep.com">support@elwynnkeep.com</a>.
            </p>
          </S>
        </div>
      </div>
    </div></div>
  );
}

import type { Metadata } from "next";

const realm = process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms and conditions governing the use of the ${realm} website and services.`,
  alternates: { canonical: "/terms" },
};

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="mb-2 text-lg font-bold uppercase" style={{ color: "var(--gold)" }}>{title}</h2>
    <div className="space-y-3" style={{ color: "var(--muted)" }}>{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="site py-12"><div className="mx-auto max-w-[860px]">
      <div className="panel">
        <div className="panel-title">Terms of Use</div>
        <div className="space-y-6">
          <p style={{ color: "var(--muted)" }}>
            By accessing or using this website (the &quot;Site&quot;) and its services (the &quot;Services&quot;), you (the
            &quot;User&quot;) agree to comply with the terms and conditions set forth below.
          </p>
          <S title="Use of Site">
            <p>
              This Site, or any portion of it, as well as the Services, may not be reproduced, duplicated, copied, sold,
              resold, or otherwise exploited for any commercial purpose. {realm} reserves the right to refuse service at
              its discretion, without limitation, if it believes a User&apos;s conduct violates applicable law or is
              harmful to the interests of {realm} or other Users.
            </p>
          </S>
          <S title="Use of Services">
            <p>
              {realm} is a non-commercial community project that runs the open-source AzerothCore server emulator to
              imitate outdated game versions for educational and software-preservation purposes only. The Site and the
              Services do not include, support, or provide any modification to game files. By using the Site or the
              Services, the User agrees to take responsibility for complying with the end-user license agreement of any
              software they use to connect.
            </p>
          </S>
          <S title="Distribution">
            <p>
              {realm} does not host or distribute any game clients, game data, artwork, or other proprietary assets. Any
              software required to connect to the realm must be obtained by the User independently.
            </p>
          </S>
          <S title="Intellectual Property">
            <p>
              The server software is AzerothCore, an open-source project distributed under its own license. All other
              names, marks, and materials referenced by the community are the property of their respective owners.{" "}
              {realm} is an independent, unofficial project and is not affiliated with, endorsed, or sponsored by any
              game publisher or developer.
            </p>
          </S>
          <S title="Site Account">
            <p>
              The User may register an account and password for the Services free of charge. The User is responsible for
              all activity under their account and password. The Site is not responsible for unauthorized access to an
              account or any loss of virtual items associated with it.
            </p>
          </S>
          <S title="Access to the Site and Services">
            <p>
              {realm} provides free access to the Site and the Services. There is no shop, no paid advantages, and no
              donations are solicited or accepted through the Site.
            </p>
          </S>
          <S title="Disclaimers and Limitation of Liability">
            <p>
              Use of the Site and the Services is at the User&apos;s sole risk. The Site and the Services are provided on
              an &quot;as is&quot; and &quot;as available&quot; basis, without warranties of any kind, express or implied,
              including but not limited to implied warranties of merchantability and fitness for a particular purpose.{" "}
              {realm} does not warrant that the Site or the Services will be uninterrupted or error-free. To the fullest
              extent permitted by applicable law, {realm} shall not be liable for any direct, indirect, incidental,
              special, or consequential damages resulting from the use of, or inability to use, the Site and the
              Services, including loss of characters, virtual items, or data.
            </p>
          </S>
          <S title="Termination of Service">
            <p>
              {realm} reserves the right, at its sole discretion, to change, suspend, limit, or discontinue any aspect of
              the Services at any time, and to suspend or terminate any User&apos;s access to all or part of the Site and
              the Services, without notice, for any conduct it believes violates these terms.
            </p>
          </S>
          <S title="Acknowledgement">
            <p>
              By accessing or using the Site and the Services, the User agrees to be bound by these terms, including the
              disclaimers above. {realm} reserves the right to change the Site and these terms at any time. If you do not
              agree with these terms or are not satisfied with the Services, your sole and exclusive remedy is to
              discontinue your use of the Services.
            </p>
          </S>
        </div>
      </div>
    </div></div>
  );
}
